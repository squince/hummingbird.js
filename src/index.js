const EventEmitter = require('./event_emitter');
const MetaStore = require('./meta_store');
const TokenStore = require('./token_store');
const Tokenizer = require('./tokenizer');
const VariantStore = require('./variant_store');

(function() {
  // ## Index
  // The object that manages everything

  // Most importantly it contains the inverted index of tokens
  // found in each name in the corpus, associated meta data, and methods
  // for interacting with the data

  // ### constructor
  // Set _hummingbird.Index.tokenizer_ to any javascript object that has
  // a method _tokenize_ that takes a string and returns an array of values
  // that will be used to find this string when the index is searched.

  // Example:
  // ```javascript
  // idx = new hummingbird.index();
  // idx.tokenizer = new hummingbird.tokenizer(2,3)
  // idx.variantStore.variants = {'steve': ['steven', 'stephen', 'stefan']}
  // ```
  hummingbird.Index = function(variantsObj) {
    this.createTime = new Date();
    this.lastUpdate = null;
    this.tokenStore = new hummingbird.TokenStore();
    this.metaStore = new hummingbird.MetaStore();
    if (variantsObj != null) {
      this.variantStore = new hummingbird.VariantStore(variantsObj);
    } else {
      this.variantStore = new hummingbird.VariantStore();
    }
    this.eventEmitter = new hummingbird.EventEmitter();
    this.tokenizer = new hummingbird.tokenizer();
    this.utils = new hummingbird.Utils();
  };

  // ### ::on
  // Binds handler to events emitted by the index
  hummingbird.Index.prototype.on = function() {
    var args;
    args = Array.prototype.slice.call(arguments);
    return this.eventEmitter.addListener.apply(this.eventEmitter, args);
  };

  // ### ::off
  // Removes handler from event emitted by the index
  hummingbird.Index.prototype.off = function(name, fn) {
    return this.eventEmitter.removeListener(name, fn);
  };

  // ### ::load
  // Loads serialized index and issues a warning if the index being imported is in a different format
  // than what is now supported by this version of hummingbird
  hummingbird.Index.load = function(serializedData) {
    var idx;
    idx = new (this)();
    if (serializedData.index_version !== hummingbird.index_version) {
      idx.utils.warn('version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version);
    }
    idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore);
    idx.metaStore = serializedData.hasOwnProperty('metaStore') ? hummingbird.MetaStore.load(serializedData.metaStore) : undefined;
    idx.variantStore = serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
    idx.createTime = serializedData.createTime != null ? new Date(serializedData.createTime) : null;
    idx.lastUpdate = serializedData.lastUpdate != null ? new Date(serializedData.lastUpdate) : null;
    return idx;
  };

  // ### ::add
  // Add a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
  // Takes an Object as an argument.
  // * _doc.id_ = must be a unique identifier within a given index

  // Then, there are two options in order to have something to search:
  // * _doc.name_ = this string will be indexed

  // Optionally includes additional arbitrary name-value pairs to be stored, but not indexed
  hummingbird.Index.prototype.add = function(doc, emitEvent) {
    emitEvent = (emitEvent === undefined ? true : emitEvent);
    if (this.metaStore.has(doc.id)) {
      if (hummingbird.loggingOn) {
        this.utils.debugLog(`Document ${doc.id} already indexed, replacing`);
      }
      this.update(doc, emitEvent);
      return;
    }
    this._tokenizeDoc(doc);
    this.metaStore.add(doc);
    this.lastUpdate = new Date();
    if (emitEvent) {
      this.eventEmitter.emit('add', doc, this);
    }
  };

  // ### ::_tokenizeDoc
  // Internal method to tokenize and add doc to tokenstore.  Used by add and update methods
  hummingbird.Index.prototype._tokenizeDoc = function(doc) {
    var j, k, len, len1, results1, token, tokens, variant_tokens;
    // tokenize the doc
    if ((doc != null ? doc.name : void 0) != null) {
      tokens = this.tokenizer.tokenize(doc.name);
      variant_tokens = this.variantStore.getVariantTokens(doc.name, this.tokenizer, tokens);
    } else {
      if (hummingbird.loggingOn) {
        this.utils.debugLog(`No 'name' property in doc\n${JSON.stringify(doc)}`);
      }
      tokens = [];
      variant_tokens = [];
    }
// add the name tokens to the tokenStore
// do this before variant tokens are added to ensure tokens are distinct
    for (j = 0, len = tokens.length; j < len; j++) {
      token = tokens[j];
      this.tokenStore.add(token, false, doc.id);
    }
// add the variant tokens to the tokenStore
    results1 = [];
    for (k = 0, len1 = variant_tokens.length; k < len1; k++) {
      token = variant_tokens[k];
      results1.push(this.tokenStore.add(token, true, doc.id));
    }
    return results1;
  };

  // ### ::remove
  // Removes the document from the index that is referenced by the 'id' property.
  hummingbird.Index.prototype.remove = function(docRef, emitEvent) {
    emitEvent = (emitEvent === undefined && this.metaStore.has(docRef) ? true : emitEvent);
    if (this.metaStore.has(docRef)) {
      //Only check the tokens for the doc name - don't loop over all tokens.
      this.tokenStore.remove(docRef, this.tokenizer.tokenize(this.metaStore.get(docRef).name));
      this.metaStore.remove(docRef);
      this.lastupdate = new Date();
      if (emitEvent) {
        this.eventEmitter.emit('remove', docRef, this);
      }
    }
  };

  // ### ::update
  // Updates the document from the index that is referenced by the 'id' property
  // In case the name has changed, we remove the old tokens and retokenize.
  // Otherwise, we just update the metaStore.
  hummingbird.Index.prototype.update = function(doc, emitEvent) {
    emitEvent = (emitEvent === undefined ? true : emitEvent);
    if (this.metaStore.has(doc.id)) {
      //Has the name changed?
      if (doc.name !== this.metaStore.get(doc.id).name) {
        this.remove(doc.id, false);
        this._tokenizeDoc(doc);
      } else {
        this.metaStore.remove(doc.id);
      }
      this.metaStore.add(doc);
      if (emitEvent) {
        this.eventEmitter.emit('update', doc, this);
      }
    }
  };

  // ### ::search
  // Takes a callback function that has the resultSet array and a profile object as arguments.
  // Optionally, takes an options object with the following possible properties
  // * _howMany_ - the maximum number of results to be returned (_default=10_)
  // * _startPos_ - how far into the sorted matched set should the returned resultset start (_default=0_)
  // * _scoreThreshold_ - (number between 0,1 inclusive) only matches with a score equal to or greater
  //   than this fraction of the maximum theoretical score will be returned in the result set (_default=0.5_,
  //   includes all matches)
  // * _boostPrefix_ - (boolean) if _true_ provides an additional boost to results that start with the first
  //   query token (_default=true_)
  // * _secondarySortField_ - (string) if provided, results are sorted first by score descending,
  //   then by the property represented by this string
  // * _secondarySortOrder_ - (string; 'asc' or 'desc') optionally specifies whether sort on secondarySortField
  //   is ascending or descending

  // Finds matching names and returns them in order of best match.
  hummingbird.Index.prototype.search = function(query, callback, options) {
    var docSetArray, docSetHash, exactMatch, finishTime, hasSomeToken, key, maxScore, minNumQueryTokens, minScore, numResults, offset, prefixBoost, queryTokens, resultSet, results, secondarySortField, secondarySortOrder, startArraySort, startHashArray, startTime;
    startTime = new Date();
    if (hummingbird.loggingOn) {
      this.utils.logTiming('find matching docs');
    }
    if ((query == null) || query.length < (this.tokenizer.min - 1)) {
      callback([], {
        hbTotalTime: new Date() - startTime
      });
      return;
    }
    // search options
    numResults = ((options != null ? options.howMany : void 0) === undefined) ? 10 : Math.floor(options.howMany);
    offset = ((options != null ? options.startPos : void 0) === undefined) ? 0 : Math.floor(options.startPos);
    prefixBoost = options != null ? options.boostPrefix : void 0;
    secondarySortField = ((options != null ? options.secondarySortField : void 0) === undefined) ? 'name' : options.secondarySortField;
    secondarySortOrder = ((options != null ? options.secondarySortOrder : void 0) === undefined) ? 'asc' : options.secondarySortOrder;
    // initialize result set vars and search options
    docSetHash = {};
    docSetArray = [];
    queryTokens = this.tokenizer.tokenize(query);
    maxScore = this.utils.maxScore(query, this.tokenizer, prefixBoost);
    if ((options != null ? options.scoreThreshold : void 0) == null) {
      minScore = 0.5 * maxScore;
      minNumQueryTokens = Math.ceil(queryTokens.length * 0.5);
    } else if ((options != null ? options.scoreThreshold : void 0) <= 0) {
      minScore = 0;
      minNumQueryTokens = queryTokens.length;
    } else if ((options != null ? options.scoreThreshold : void 0) >= 1) {
      minScore = maxScore;
      minNumQueryTokens = 0;
    } else {
      minScore = options.scoreThreshold * maxScore;
      minNumQueryTokens = Math.ceil(queryTokens.length * (1 - options.scoreThreshold));
    }
    hasSomeToken = queryTokens.some(function(token) {
      return this.tokenStore.has(token);
    }, this);
    if (!hasSomeToken) {
      callback([], {
        hbTotalTime: new Date() - startTime
      });
      return;
    }
    // retrieve docs from tokenStore
    queryTokens.forEach((function(token, i, tokens) {
      var docRef, startMatchTime, startVariantMatch;
      if (hummingbird.loggingOn) {
        startMatchTime = this.utils.logTiming(`'${token}' score start`);
      }
// name matches
      for (docRef in this.tokenStore.get(token, false)) {
        switch (false) {
          case !((docSetHash[docRef] == null) && i <= minNumQueryTokens):
            docSetHash[docRef] = this.utils.tokenScore(token, false, prefixBoost);
            break;
          case docSetHash[docRef] == null:
            docSetHash[docRef] += this.utils.tokenScore(token, false, prefixBoost);
        }
      }
      if (hummingbird.loggingOn) {
        startVariantMatch = this.utils.logTiming(`\t\toriginal name:\t\t${Object.keys(this.tokenStore.get(token, false)).length} `, startMatchTime);
      }
// variant matches
      for (docRef in this.tokenStore.get(token, true)) {
        switch (false) {
          case !((docSetHash[docRef] == null) && i <= minNumQueryTokens):
            docSetHash[docRef] = this.utils.tokenScore(token, true, prefixBoost);
            break;
          case docSetHash[docRef] == null:
            docSetHash[docRef] += this.utils.tokenScore(token, true, prefixBoost);
        }
      }
      if (hummingbird.loggingOn) {
        this.utils.logTiming(`\t\tvariant matches:\t${Object.keys(this.tokenStore.get(token, true)).length} `, startVariantMatch);
      }
    }), this);
    // convert hash to array of hashes for sorting
    // filter out results below the minScore
    // boost exact matches - consciously does not convert diacritics, but uncertain whether that's best
    startHashArray = new Date();
    if (hummingbird.loggingOn) {
      this.utils.logTiming('hash to sorted array\n');
    }
    for (key in docSetHash) {
      if (docSetHash[key] >= minScore) {
        // exact match?
        exactMatch = this.utils.normalizeString(query) === this.utils.normalizeString(this.metaStore.get(key).name) ? true : false;
        // Make fields we retrieve optionally include custom secondarySortField value
        if (secondarySortField === 'name') {
          docSetArray.push({
            id: key,
            score: exactMatch ? docSetHash[key] + 0.1 : docSetHash[key],
            name: this.metaStore.get(key).name
          });
        } else {
          docSetArray.push({
            id: key,
            score: exactMatch ? docSetHash[key] + 0.1 : docSetHash[key],
            name: this.metaStore.get(key).name,
            custSortField: this.metaStore.get(key)[secondarySortField] != null ? this.metaStore.get(key)[secondarySortField] : void 0
          });
        }
      }
    }
    startArraySort = new Date();
    docSetArray.sort(function(a, b) {
      var compareObjects;
      // Determines sort value (-1, 0, 1) based on data type and sort order
      // stolen from nectar
      compareObjects = function(a, b, property, order) {
        var aprop, bprop, ref, ref1, ref2, ref3, sortOrder;
        sortOrder = order === 'desc' ? -1 : 1;
        aprop = ((ref = a[property]) != null ? ref.toLowerCase : void 0) != null ? (ref1 = a[property]) != null ? ref1.toLowerCase() : void 0 : a[property];
        bprop = ((ref2 = b[property]) != null ? ref2.toLowerCase : void 0) != null ? (ref3 = b[property]) != null ? ref3.toLowerCase() : void 0 : b[property];
        if (aprop === null && bprop !== null) {
          return 1;
        } else if (bprop === null) {
          return -1;
        } else {
          return sortOrder * (aprop > bprop ? 1 : (aprop < bprop ? -1 : 0));
        }
      };
      if (a.score !== b.score) {
        // sort on score only
        return compareObjects(a, b, 'score', 'desc');
      } else {
        if (secondarySortField === 'name') {
          // no custom sort, secondary sort on name
          return compareObjects(a, b, 'name', secondarySortOrder);
        } else {
          if (a.custSortField !== b.custSortField) {
            // custom secondary sort
            return compareObjects(a, b, 'custSortField', secondarySortOrder);
          } else {
            // ternary sort on name
            return compareObjects(a, b, 'name', 'asc');
          }
        }
      }
    });
    // loop over limited return set and augment with meta
    results = docSetArray.slice(offset, numResults);
    if (hummingbird.loggingOn) {
      this.utils.debugLog('**********');
      this.utils.debugLog("score\tname (id)");
    }
    resultSet = results.map(function(result, i, results) {
      result = this.metaStore.get(result.id);
      result.score = Math.round(results[i].score * 10) / 10;
      if (hummingbird.loggingOn) {
        this.utils.debugLog(`${result.score}\t${result.name} (${result.id})`);
      }
      return result;
    }, this);
    finishTime = new Date();
    callback(resultSet, {
      hbTotalTime: finishTime - startTime,
      findDocsTime: startHashArray - startTime,
      hashToArrayTime: startArraySort - startHashArray,
      sortArrayTime: finishTime - startArraySort
    });
    if (hummingbird.loggingOn) {
      this.utils.logTiming('SUMMARY:');
      this.utils.debugLog("");
      this.utils.debugLog(`hash size:\t${Object.keys(docSetHash).length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
      this.utils.debugLog(`array size:\t${docSetArray.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
      this.utils.debugLog(`min score:\t${minScore}`);
      this.utils.debugLog(`max score:\t${maxScore}`);
      this.utils.debugLog(`query time:\t${finishTime - startTime} ms`);
      this.utils.debugLog(`\t\t${startHashArray - startTime} ms - finding docs`);
      this.utils.debugLog(`\t\t${startArraySort - startHashArray} ms - sorting array`);
      this.utils.debugLog(`\t\t${finishTime - startArraySort} ms - hash to array`);
      return this.utils.debugLog("***************");
    }
  };

  // ### ::jump
  // Takes a callback function that has the result object as its only argument.
  hummingbird.Index.prototype.jump = function(query, callback) {
    var r, startTime;
    startTime = new Date();
    if (hummingbird.loggingOn) {
      this.utils.debugLog('**********');
    }
    if (hummingbird.loggingOn) {
      this.utils.logTiming('get matching doc');
    }
    if ((query == null) || query.length < 1) {
      return callback([], {
        hbTotalTime: new Date() - startTime
      });
    } else {
      r = this.metaStore.get(query);
      if (r != null) {
        return callback([r], {
          hbTotalTime: new Date() - startTime
        });
      } else {
        return callback([], {
          hbTotalTime: new Date() - startTime
        });
      }
    }
  };

  // ### ::toJSON
  // Returns a representation of the index ready for serialization.
  hummingbird.Index.prototype.toJSON = function() {
    return {
      version: hummingbird.version,
      index_version: hummingbird.index_version,
      tokenStore: this.tokenStore.toJSON(),
      metaStore: this.metaStore.toJSON(),
      variantStore: this.variantStore.toJSON(),
      createTime: this.createTime.getTime(),
      lastUpdate: this.lastUpdate.getTime()
    };
  };

}).call(this);
