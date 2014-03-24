var hummingbird;

hummingbird = function(variantsObj) {
  var idx;
  idx = new hummingbird.Index(variantsObj);
  return idx;
};

hummingbird.loggingOn = false;

hummingbird.version = "0.5.5";

hummingbird.index_version = "3.0";

if (typeof module !== 'undefined' && module !== null) {
  module.exports = hummingbird;
}

hummingbird.Utils = function() {
  this.root = {};
};

hummingbird.Utils.prototype.warn = function(message) {
  if (console.warn) {
    return console.warn(message);
  }
};

hummingbird.Utils.prototype.logTiming = function(msg) {
  var d;
  if (console.log && hummingbird.loggingOn) {
    d = new Date();
    return console.log(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' - ' + msg);
  }
};

hummingbird.Utils.prototype.normalizeString = function(str) {
  var re_end, re_start;
  re_start = /^\u0002/;
  re_end = /\u0003$/;
  str = diacritics.remove((str.toString()).toLowerCase());
  str = str.replace(re_start, '');
  str = str.replace(re_end, '');
  return '\u0002' + str + '\u0003';
};

hummingbird.Utils.prototype.maxScore = function(phrase, tokenizer, boost) {
  var score;
  score = 0;
  if (phrase == null) {
    return score;
  }
  (tokenizer.tokenize(phrase)).forEach((function(token, i, tokens) {
    return score += this.tokenScore(token, boost);
  }), this);
  return score;
};

hummingbird.Utils.prototype.tokenScore = function(token, boost) {
  var len, score;
  len = token.length;
  return score = boost && token.substring(0, 1) === '\u0002' ? len + 2 : len;
};

hummingbird.EventEmitter = function() {
  this.events = {};
};

hummingbird.EventEmitter.prototype.addListener = function() {
  var args, fn, names;
  args = Array.prototype.slice.call(arguments);
  fn = args.pop();
  names = args;
  if (typeof fn !== 'function') {
    throw new TypeError('last argument must be a function');
  }
  names.forEach((function(name) {
    if (!this.hasHandler(name)) {
      this.events[name] = [];
    }
    this.events[name].push(fn);
  }), this);
};

hummingbird.EventEmitter.prototype.removeListener = function(name, fn) {
  var fnIndex;
  if (!this.hasHandler(name)) {
    return;
  }
  fnIndex = this.events[name].indexOf(fn);
  this.events[name].splice(fnIndex, 1);
  if (!this.events[name].length) {
    delete this.events[name];
  }
};

hummingbird.EventEmitter.prototype.emit = function(name) {
  var args;
  if (!this.hasHandler(name)) {
    return;
  }
  args = Array.prototype.slice.call(arguments, 1);
  this.events[name].forEach(function(fn) {
    fn.apply(undefined, args);
  });
};

hummingbird.EventEmitter.prototype.hasHandler = function(name) {
  return name in this.events;
};

hummingbird.Index = function(variantsObj) {
  this.tokenStore = new hummingbird.TokenStore;
  this.metaStore = new hummingbird.MetaStore;
  if (variantsObj != null) {
    this.variantStore = new hummingbird.VariantStore(variantsObj);
  } else {
    this.variantStore = new hummingbird.VariantStore;
  }
  this.eventEmitter = new hummingbird.EventEmitter;
  this.tokenizer = new hummingbird.tokenizer;
  this.utils = new hummingbird.Utils;
};

hummingbird.Index.prototype.on = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  return this.eventEmitter.addListener.apply(this.eventEmitter, args);
};

hummingbird.Index.prototype.off = function(name, fn) {
  return this.eventEmitter.removeListener(name, fn);
};

hummingbird.Index.load = function(serializedData) {
  var idx;
  idx = new this;
  if (serializedData.index_version !== hummingbird.index_version) {
    idx.utils.warn('version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version);
  }
  idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore);
  idx.metaStore = serializedData.hasOwnProperty('metaStore') ? hummingbird.MetaStore.load(serializedData.metaStore) : undefined;
  idx.variantStore = serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
  return idx;
};

hummingbird.Index.prototype.add = function(doc, emitEvent, indexCallback) {
  var allDocumentTokens, i, name, token, tokens;
  allDocumentTokens = {};
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  if (this.metaStore.has(doc.id)) {
    console.warn("Document " + doc.id + " already indexed, replacing");
    this.update(doc, emitEvent);
    return;
  }
  if (indexCallback) {
    name = "" + (indexCallback(doc));
  } else {
    name = doc['name'];
  }
  tokens = this.tokenizer.tokenize(name);
  tokens = tokens.concat(this.variantStore.getVariantTokens(name, this.tokenizer, tokens));
  for (i in tokens) {
    token = tokens[i];
    allDocumentTokens[token] = token.length;
  }
  Object.keys(allDocumentTokens).forEach((function(token) {
    this.tokenStore.add(token, doc.id);
  }), this);
  this.metaStore.add(doc);
  if (emitEvent) {
    this.eventEmitter.emit('add', doc, this);
  }
};

hummingbird.Index.prototype.remove = function(docRef, emitEvent) {
  emitEvent = (emitEvent === undefined && this.metaStore.has(docRef) ? true : emitEvent);
  this.metaStore.remove(docRef);
  this.tokenStore.remove(docRef);
  if (emitEvent) {
    this.eventEmitter.emit('remove', docRef, this);
  }
};

hummingbird.Index.prototype.update = function(doc, emitEvent) {
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  this.remove(doc.id, false);
  this.add(doc, false);
  if (emitEvent) {
    this.eventEmitter.emit('update', doc, this);
  }
};

hummingbird.Index.prototype.search = function(query, callback, options) {
  var boost, docSetArray, docSetHash, hasSomeToken, key, maxScore, numResults, offset, queryTokens, resultSet, results, threshold;
  if ((query == null) || query.length < (this.tokenizer.min - 1)) {
    callback([]);
  }
  numResults = (options != null ? options.howMany : void 0) === undefined ? 10 : Math.floor(options.howMany);
  offset = (options != null ? options.startPos : void 0) === undefined ? 0 : Math.floor(options.startPos);
  boost = ((options != null ? options.boostPrefix : void 0) == null) || options.boostPrefix === true ? true : false;
  docSetHash = {};
  docSetArray = [];
  maxScore = this.utils.maxScore(query, this.tokenizer, boost);
  queryTokens = this.tokenizer.tokenize(query);
  hasSomeToken = queryTokens.some(function(token) {
    return this.tokenStore.has(token);
  }, this);
  if (!hasSomeToken) {
    callback([]);
  }
  this.utils.logTiming('find matching docs * start');
  queryTokens.forEach((function(token, i, tokens) {
    this.tokenStore.get(token).forEach((function(docRef, i, documents) {
      var docScore;
      docScore = this.utils.tokenScore(token, boost);
      if (docRef in docSetHash) {
        docSetHash[docRef] += docScore;
      } else {
        docSetHash[docRef] = docScore;
      }
    }), this);
  }), this);
  this.utils.logTiming('find matching docs * finish');
  if ((options != null ? options.scoreThreshold : void 0) == null) {
    threshold = 0.5 * maxScore;
  } else if ((options != null ? options.scoreThreshold : void 0) < 0) {
    threshold = 0;
  } else if ((options != null ? options.scoreThreshold : void 0) > 1) {
    threshold = maxScore;
  } else {
    threshold = options.scoreThreshold * maxScore;
  }
  this.utils.logTiming('hash to array * start');
  for (key in docSetHash) {
    if (docSetHash[key] >= threshold) {
      docSetArray.push({
        id: key,
        score: docSetHash[key],
        n: (this.metaStore.get(key)).name.toLowerCase()
      });
    }
  }
  this.utils.logTiming('hash to array * finish');
  this.utils.logTiming('array size = ' + docSetArray.length);
  this.utils.logTiming('sort * start');
  docSetArray.sort(function(a, b) {
    if (a.score === b.score) {
      switch (false) {
        case !(a.n < b.n):
          return -1;
        case !(a.n > b.n):
          return 1;
        default:
          return 0;
      }
    } else {
      return b.score - a.score;
    }
  });
  this.utils.logTiming('sort * finish');
  this.utils.logTiming('add meta * start');
  results = docSetArray.slice(offset, numResults);
  resultSet = results.map(function(result, i, results) {
    result = this.metaStore.get(result.id);
    result.score = results[i].score;
    this.utils.logTiming("id: " + result.id + ", score: " + result.score);
    return result;
  }, this);
  callback(resultSet);
  return this.utils.logTiming('add meta * finish');
};

hummingbird.Index.prototype.toJSON = function() {
  return {
    version: hummingbird.version,
    index_version: hummingbird.index_version,
    tokenStore: this.tokenStore.toJSON(),
    metaStore: this.metaStore.toJSON(),
    variantStore: this.variantStore.toJSON()
  };
};

hummingbird.MetaStore = function() {
  this.root = {};
};

hummingbird.MetaStore.load = function(serializedData) {
  var store;
  store = new this;
  store.root = serializedData.root;
  return store;
};

hummingbird.MetaStore.prototype.toJSON = function() {
  return {
    root: this.root
  };
};

hummingbird.MetaStore.prototype.add = function(doc) {
  if (!(this.has(doc['id']) || doc === undefined)) {
    this.root[doc['id']] = doc;
  }
};

hummingbird.MetaStore.prototype.has = function(docId) {
  if (!docId) {
    return false;
  }
  if (docId in this.root) {
    return true;
  } else {
    return false;
  }
};

hummingbird.MetaStore.prototype.get = function(docId) {
  return this.root[docId] || {};
};

hummingbird.MetaStore.prototype.remove = function(docId) {
  if (!docId || !this.root[docId]) {
    return;
  }
  return delete this.root[docId];
};

hummingbird.TokenStore = function() {
  this.root = {};
};

hummingbird.TokenStore.load = function(serializedData) {
  var store;
  store = new this;
  store.root = serializedData.root;
  return store;
};

hummingbird.TokenStore.prototype.toJSON = function() {
  return {
    root: this.root
  };
};

hummingbird.TokenStore.prototype.add = function(token, docId) {
  if (!this.has(token)) {
    this.root[token] = [];
  }
  if (this.root[token][docId] === undefined) {
    this.root[token].push(docId);
  }
};

hummingbird.TokenStore.prototype.has = function(token) {
  if (!token) {
    return false;
  }
  if (token in this.root) {
    return true;
  } else {
    return false;
  }
};

hummingbird.TokenStore.prototype.get = function(token) {
  return this.root[token] || [];
};

hummingbird.TokenStore.prototype.count = function(token) {
  if (!token || !this.root[token]) {
    return 0;
  }
  return this.root[token].length;
};

hummingbird.TokenStore.prototype.remove = function(docRef) {
  return Object.keys(this.root).forEach((function(token) {
    var loc;
    loc = this.root[token].indexOf(docRef);
    if (loc === -1) {
      return;
    }
    this.root[token].splice(loc, 1);
    if (this.root[token].length === 0) {
      delete this.root[token];
    }
  }), this);
};

hummingbird.tokenizer = function(min, max) {
  this.utils = new hummingbird.Utils;
  if (!arguments.length || (min == null) || typeof min !== 'number' || min < 1) {
    this.min = 3;
  } else {
    this.min = min;
  }
  if (arguments.length < 2 || (max == null) || typeof max !== 'number' || max < min) {
    this.max = this.min;
  } else {
    this.max = max;
  }
};

hummingbird.tokenizer.prototype.tokenize = function(name) {
  var alltokens, buffer, i, n, norm_name, token;
  norm_name = this.utils.normalizeString(name);
  if (!arguments.length || (norm_name == null) || norm_name === undefined) {
    return [];
  }
  alltokens = [];
  n = this.min;
  while (n <= this.max) {
    buffer = [];
    if (norm_name.length <= n && buffer.indexOf(norm_name) === -1) {
      buffer.push(norm_name);
    } else {
      i = 0;
      while (i <= norm_name.length - n) {
        token = norm_name.slice(i, i + n);
        if (buffer.indexOf(token) === -1) {
          buffer.push(token);
        }
        i++;
      }
    }
    alltokens = alltokens.concat(buffer);
    n++;
  }
  return alltokens;
};

hummingbird.VariantStore = function(variantsObj) {
  var name, norm_name;
  this.variants = {};
  this.utils = new hummingbird.Utils;
  if (variantsObj != null) {
    for (name in variantsObj) {
      norm_name = this.utils.normalizeString(name);
      this.variants[norm_name] = [];
      variantsObj[name].forEach((function(variant, i, variants) {
        var normVariant;
        normVariant = this.utils.normalizeString(variant);
        return this.variants[norm_name].push(normVariant);
      }), this);
    }
  }
};

hummingbird.VariantStore.load = function(serializedData) {
  var store;
  store = new this;
  store.variants = serializedData.hasOwnProperty('variants') ? serializedData.variants : void 0;
  return store;
};

hummingbird.VariantStore.prototype.toJSON = function() {
  return {
    variants: this.variants
  };
};

hummingbird.VariantStore.prototype.getVariantTokens = function(name, tokenizer, tokens) {
  var matched_variants, norm_name, variant_tokens;
  matched_variants = [];
  variant_tokens = {};
  norm_name = this.utils.normalizeString(name);
  if ((norm_name == null) || norm_name === undefined) {
    return variant_tokens;
  }
  if (this.variants.hasOwnProperty(norm_name)) {
    this.variants[norm_name].forEach((function(variant, i, variants) {
      var token, _i, _len, _ref, _results;
      _ref = tokenizer.tokenize(variant);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        token = _ref[_i];
        if (tokens.indexOf(token) === -1) {
          _results.push(variant_tokens[token] = null);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }), this);
  }
  if (norm_name !== norm_name.split(/\s+/)[0]) {
    norm_name.split(/\s+/).forEach((function(name_part, j, names) {
      var renorm_name_part;
      renorm_name_part = this.utils.normalizeString(name_part);
      if (this.variants.hasOwnProperty(renorm_name_part)) {
        return this.variants[renorm_name_part].forEach((function(variant, i, variants) {
          var token, _i, _len, _ref, _results;
          _ref = tokenizer.tokenize(variant);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            token = _ref[_i];
            if (tokens.indexOf(token) === -1) {
              _results.push(variant_tokens[token] = null);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }), this);
      }
    }), this);
  }
  return Object.keys(variant_tokens);
};
