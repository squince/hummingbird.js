var hummingbird;

hummingbird = function(variantsObj) {
  var idx;
  idx = new hummingbird.Index(variantsObj);
  return idx;
};

hummingbird.loggingOn = false;

hummingbird.version = "0.5.0";

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
  return diacritics.remove((str.toString()).toLowerCase());
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
  var allDocumentTokens, i, token, tokens;
  allDocumentTokens = {};
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  if (indexCallback) {
    tokens = this.tokenizer.tokenize("" + (indexCallback(doc)));
  } else {
    tokens = this.tokenizer.tokenize(doc['name']);
  }
  for (i in tokens) {
    token = tokens[i];
    allDocumentTokens[token] = token.length;
  }
  Object.keys(allDocumentTokens).forEach((function(token) {
    this.tokenStore.add(token, doc['id']);
  }), this);
  this.metaStore.add(doc);
  if (emitEvent) {
    this.eventEmitter.emit('add', doc, this);
  }
};

hummingbird.Index.prototype.remove = function(docRef, emitEvent) {
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  this.metaStore.remove(docRef);
  this.tokenStore.remove(docRef);
  if (emitEvent) {
    this.eventEmitter.emit('remove', docRef, this);
  }
};

hummingbird.Index.prototype.update = function(doc, emitEvent) {
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  this.remove(doc, false);
  this.add(doc, false);
  if (emitEvent) {
    this.eventEmitter.emit('update', doc, this);
  }
};

hummingbird.Index.prototype.search = function(query, callback, options) {
  var boost, docSetArray, docSetHash, hasSomeToken, key, maxScore, norm_query, numResults, offset, queryTokens, resultSet, results, threshold;
  if ((query == null) || query.length < (this.tokenizer.min - 1)) {
    callback([]);
  }
  numResults = (options != null ? options.howMany : void 0) === undefined ? 10 : Math.floor(options.howMany);
  offset = (options != null ? options.startPos : void 0) === undefined ? 0 : Math.floor(options.startPos);
  boost = ((options != null ? options.boostPrefix : void 0) == null) || (options != null ? options.boostPrefix : void 0) ? true : false;
  maxScore = this.utils.maxScore(query, this.tokenizer, boost);
  docSetHash = {};
  docSetArray = [];
  norm_query = this.utils.normalizeString(query);
  queryTokens = this.tokenizer.tokenize(norm_query);
  hasSomeToken = queryTokens.some(function(token) {
    return this.tokenStore.has(token);
  }, this);
  if (!hasSomeToken) {
    return [];
  }
  this.utils.logTiming('find matching docs * start');
  queryTokens.forEach((function(token, i, tokens) {
    this.tokenStore.get(token).forEach((function(docRef, i, documents) {
      var docScore;
      docScore = this.utils.tokenScore(token, options);
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
        score: docSetHash[key]
      });
    }
  }
  this.utils.logTiming('hash to array * finish');
  this.utils.logTiming('array size = ' + docSetArray.length);
  this.utils.logTiming('sort * start');
  docSetArray.sort(function(a, b) {
    return b.score - a.score;
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

hummingbird.tokenizer.prototype.tokenize = function(obj) {
  var alltokens, buffer, i, n, normalized_name, token;
  if (!arguments.length || (obj == null) || obj === undefined) {
    return [];
  }
  normalized_name = '\u0002' + this.utils.normalizeString(obj) + '\u0003';
  alltokens = [];
  n = this.min;
  while (n <= this.max) {
    buffer = [];
    if (normalized_name.length <= n && buffer.indexOf(normalized_name) === -1) {
      buffer.push(normalized_name);
    } else {
      i = 0;
      while (i <= normalized_name.length - n) {
        token = normalized_name.slice(i, i + n);
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
  var key, normKey;
  this.variants = {};
  this.invertedVariants = {};
  this.utils = new hummingbird.Utils;
  if (variantsObj != null) {
    for (key in variantsObj) {
      normKey = this.utils.normalizeString(key);
      this.variants[normKey] = [];
      variantsObj[key].forEach((function(variant, i, variants) {
        var normVariant, _base;
        normVariant = this.utils.normalizeString(variant);
        this.variants[normKey].push(normVariant);
        if ((_base = this.invertedVariants)[normVariant] == null) {
          _base[normVariant] = [];
        }
        return this.invertedVariants[normVariant].push(normKey);
      }), this);
    }
  }
};

hummingbird.VariantStore.load = function(serializedData) {
  var store;
  store = new this;
  store.variants = serializedData.hasOwnProperty('variants') ? serializedData.variants : void 0;
  store.invertedVariants = serializedData.hasOwnProperty('invertedVariants') ? serializedData.invertedVariants : void 0;
  return store;
};

hummingbird.VariantStore.prototype.toJSON = function() {
  return {
    variants: this.variants,
    invertedVariants: this.invertedVariants
  };
};


/* ::add
Adds a new variant, document 'id' pair to the store
NO LONGER NECESSARY - ALL VARIANTS TOKENIZED AND STORED IN TOKENSTORE

hummingbird.VariantStore::add = (full_name, score, docId) ->
  norm_name = @utils.normalizeString full_name
   * first check to see if the norm_name has variants
  if @variants.hasOwnProperty norm_name
    @root[norm_name] ?=
      score: score
      docs: []
    @root[norm_name].docs.push docId

  if @invertedVariants.hasOwnProperty norm_name
     * associate the documents for each variant with the original norm_name
    @invertedVariants[norm_name].forEach ((variant, i, variantsArray) ->
      @root[variant] ?=
        score: score
        docs: []
      @root[variant].docs.push docId
    ), this

   * then split the full name on word boundaries and check each name part
  unless norm_name is norm_name.split(/\s+/)[0]
    norm_name.split(/\s+/).forEach ((name) ->
       * check to see if each name word has any nicknames/variants
      if @variants.hasOwnProperty name
        @root[name] ?=
          score: score
          docs: []
        @root[name].docs.push docId
      if @invertedVariants.hasOwnProperty name
         * associate the documents for each variant with the original norm_name
        @invertedVariants[name].forEach ((variant, i, variantsArray) ->
          @root[variant] ?=
            score: score
            docs: []
          @root[variant].docs.push docId
        ), this
    ), this
  return
 */


/* ::has
Checks whether this key is contained within this hummingbird.VariantStore.

hummingbird.VariantStore::has = (variant) ->
  norm_variant = @utils.normalizeString variant
  return false  unless norm_variant
  if norm_variant of @root
    return true
  else
    return false
  return
 */


/* ::get
Retrieve the documents for the given variant

hummingbird.VariantStore::get = (variant) ->
  @root[variant].docs or []
 */


/* ::count
Number of documents associated with the given variant

hummingbird.VariantStore::count = (variant) ->
  return 0  if not variant or not @root[variant]
  @root[variant].docs.length
 */


/* ::remove
Remove the document identified by docId from the variant in the store

hummingbird.VariantStore::remove = (docRef) ->
  Object.keys(this.root).forEach ((variant) ->
    loc = @root[variant].indexOf(docRef)
    return  if loc is -1
    @root[variant].splice loc, 1
    delete @root[variant]  if @root[variant].length is 0
    return
  ), this
 */
