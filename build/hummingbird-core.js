var hummingbird;

hummingbird = function() {
  var idx;
  idx = new hummingbird.Index;
  return idx;
};

hummingbird.loggingOn = false;

hummingbird.version = "0.2.0";

hummingbird.index_version = "2.0";

if (typeof module !== 'undefined') {
  module.exports = hummingbird;
}

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

hummingbird.Index = function() {
  this.tokenStore = new hummingbird.TokenStore;
  this.metaStore = new hummingbird.MetaStore;
  this.eventEmitter = new hummingbird.EventEmitter;
  this.tokenizer = new hummingbird.tokenizer;
  this.logTimer = hummingbird.utils.logTiming;
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
  if (serializedData.index_version !== hummingbird.index_version) {
    hummingbird.utils.warn('version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version);
  }
  idx = new this;
  idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore);
  idx.metaStore = hummingbird.MetaStore.load(serializedData.metaStore);
  return idx;
};

hummingbird.Index.prototype.add = function(doc, emitEvent) {
  var allDocumentTokens, fieldTokens, i, token;
  allDocumentTokens = {};
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  fieldTokens = this.tokenizer.tokenize(doc['name']);
  for (i in fieldTokens) {
    token = fieldTokens[i];
    allDocumentTokens[token] = token.length;
  }
  Object.keys(allDocumentTokens).forEach((function(token) {
    this.tokenStore.add(token, doc['id']);
  }), this);
  this.metaStore.add(doc['id'], doc);
  if (emitEvent) {
    this.eventEmitter.emit('add', doc, this);
  }
};

hummingbird.Index.prototype.remove = function(doc, emitEvent) {
  var docRef;
  docRef = doc['id'];
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  Object.keys(this.tokenStore).forEach((function(token) {
    this.tokenStore.remove(token, docRef);
  }), this);
  if (emitEvent) {
    this.eventEmitter.emit('remove', doc, this);
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

hummingbird.Index.prototype.search = function(query, howMany, startPos) {
  var documentSet, documentSets, hasSomeToken, index, key, numResults, offset, queryTokens, self;
  queryTokens = this.tokenizer.tokenize(query);
  numResults = (howMany === undefined ? 10 : howMany);
  offset = (startPos === undefined ? 0 : startPos);
  documentSets = {};
  documentSet = [];
  self = this;
  hasSomeToken = queryTokens.some(function(token) {
    return this.tokenStore.has(token);
  }, this);
  if (!hasSomeToken) {
    return [];
  }
  self.logTimer('Start - Find all docs that match each query token and score');
  queryTokens.forEach((function(token, i, tokens) {
    var localToken;
    self = this;
    localToken = token;
    self.tokenStore.get(token).forEach(function(docRef, i, documents) {
      var docScore;
      docScore = localToken.length;
      if (docRef in documentSets) {
        documentSets[docRef] = documentSets[docRef] + docScore;
      } else {
        documentSets[docRef] = docScore;
      }
    });
  }), this);
  self.logTimer('Finish - Find all docs that match each query token and score');
  index = 0;
  self.logTimer('Start - Sorting');
  for (key in documentSets) {
    documentSet.push(index);
    documentSet[index] = {
      id: key,
      score: documentSets[key]
    };
    index++;
  }
  documentSet.sort(function(a, b) {
    return b.score - a.score;
  });
  self.logTimer('Finish - Sorting');
  return documentSet.slice(offset, numResults);
};

hummingbird.Index.prototype.toJSON = function() {
  return {
    version: hummingbird.version,
    index_version: hummingbird.index_version,
    tokenStore: this.tokenStore.toJSON(),
    metaStore: this.metaStore.toJSON()
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

hummingbird.TokenStore.prototype.remove = function(token, docId) {
  var loc;
  if (!token || !this.root[token]) {
    return;
  }
  loc = this.root[token].indexOf(docId);
  if (loc === -1) {
    return;
  }
  this.root[token].splice(loc, 1);
  if (this.root[token].length === 0) {
    delete this.root[token];
  }
};

hummingbird.tokenizer = function(min, max) {
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
  var alltokens, buffer, i, n, normalized_name;
  if (!arguments.length || (obj == null) || obj === undefined) {
    return [];
  }
  normalized_name = '\u0002' + diacritics.remove(obj.toString()).toLowerCase() + '\u0003';
  alltokens = [];
  n = this.min;
  while (n <= this.max) {
    buffer = [];
    if (normalized_name.length <= n) {
      buffer.push(normalized_name);
    } else {
      i = 0;
      while (i <= normalized_name.length - n) {
        buffer.push(normalized_name.slice(i, i + n));
        i++;
      }
    }
    alltokens = alltokens.concat(buffer);
    n++;
  }
  return alltokens;
};

hummingbird.bigramtokenizer = new hummingbird.tokenizer(2);

hummingbird.trigramtokenizer = new hummingbird.tokenizer(3);

hummingbird.utils = {};

hummingbird.utils.warn = function(message) {
  if (console.warn) {
    return console.warn(message);
  }
};

hummingbird.utils.logTiming = function(msg) {
  var d;
  if (console.log && hummingbird.loggingOn) {
    d = new Date();
    return console.log(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' - ' + msg);
  }
};
