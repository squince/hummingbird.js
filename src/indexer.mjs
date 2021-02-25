import EventEmitter from './event_emitter.mjs';
import MetaStore from './meta_store.mjs';
import TokenStore from './token_store.mjs';
import VariantStore from './variant_store.mjs';
import * as Utils from "./utils.mjs";

/* Index
 * The object that contains the inverted index of tokens
 * found in each name in the corpus, associated meta data, and methods
 * for interacting with the data
*/
export default class Index {
  constructor(variantsObj, tokenizer) {
    this.createTime = new Date();
    this.lastUpdate = null;
    this.eventEmitter = new EventEmitter();
    this.metaStore = new MetaStore();
    this.tokenStore = new TokenStore();
    this.variantStore = variantsObj ?
      new VariantStore(variantsObj) :
      new VariantStore();
    this.tokenizer = tokenizer;
  }

  /* on
   * Binds handler to events emitted by the index
  */
  on(eventName, handler) {
    return this.eventEmitter.addListener(eventName, handler);
  };

  /* off
   * Removes handler from event emitted by the index
  */
  off(eventName, handler) {
    return this.eventEmitter.removeListener(eventName, handler);
  };

  /* load
   * Loads serialized index and issues a warning if the index being imported is in a different format
   * than what is now supported by this version of Humminbird
  */
  load({ tokenStore, metaStore, createTime, lastUpdate }) {
    this.createTime = createTime ? new Date(createTime) : new Date();
    this.lastUpdate = lastUpdate ? new Date(lastUpdate) : null;
    this.tokenStore.load(tokenStore);
    this.metaStore.load(metaStore);
  };

  /* add
   * Add a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
   * Takes an Object as an argument.
   * _doc.id_ = must be a unique identifier within a given index

   * Then, there are two options in order to have something to search:
   * _doc.name_ = this string will be indexed

   * Optionally includes additional arbitrary name-value pairs to be stored, but not indexed
  */
  add({doc, emitEvent, loggingOn}) {
    emitEvent = (emitEvent === undefined ? true : emitEvent);
    if (this.metaStore.has(doc.id)) {
      if (loggingOn) Utils.debugLog(`Document ${doc.id} already indexed, replacing`);
      this.update(doc, eventName);
      return;
    }
    this.tokenizeDoc(doc);
    this.metaStore.add(doc);
    this.lastUpdate = new Date();
    if (emitEvent) this.eventEmitter.emit('add', doc, this);
  };

  // tokenizeDoc
  // Internal method to tokenize and add doc to tokenstore.  Used by add and update methods
  tokenizeDoc(doc) {
    let j, k, len, len1, results1, token, tokens, variant_tokens;
    // tokenize the doc
    if ((doc != null ? doc.name : void 0) != null) {
      tokens = this.tokenizer.tokenize(doc.name);
      const {tokenizer} = this;
      const {name} = doc
      variant_tokens = this.variantStore.getVariantTokens({name, tokenizer, tokens});
    } else {
      if (this.loggingOn) Utils.debugLog(`No 'name' property in doc\n${JSON.stringify(doc)}`);
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

  // remove
  // Removes the document from the index that is referenced by the 'id' property.
  remove(docRef, emitEvent) {
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

  // update
  // Updates the document from the index that is referenced by the 'id' property
  // In case the name has changed, we remove the old tokens and retokenize.
  // Otherwise, we just update the metaStore.
  update(doc, emitEvent) {
    emitEvent = (emitEvent === undefined ? true : emitEvent);
    if (this.metaStore.has(doc.id)) {
      //Has the name changed?
      if (doc.name !== this.metaStore.get(doc.id).name) {
        this.remove(doc.id, false);
        this.tokenizeDoc(doc);
      } else {
        this.metaStore.remove(doc.id);
      }
      this.metaStore.add(doc);
      if (emitEvent) {
        this.eventEmitter.emit('update', doc, this);
      }
    }
  };

  // search
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
  search(query, callback, options) {
    const startTime = new Date();
    const { howMany, startPos, boostPrefix, secondarySortField='name', secondarySortOrder='asc', scoreThreshold } = options;
    let minNumQueryTokens, minScore;

    if (this.loggingOn) Utils.logTiming('find matching docs');

    if ((query == null) || query.length < (this.tokenizer.min - 1)) {
      callback([], {
        hbTotalTime: new Date() - startTime
      });
      return;
    }
    // search options
    const numResults = ((options != null ? howMany : void 0) === undefined) ? 10 : Math.floor(howMany);
    const offset = ((options != null ? startPos : void 0) === undefined) ? 0 : Math.floor(startPos);
    const prefixBoost = options != null ? boostPrefix : void 0;
    // initialize result set vars and search options
    const docSetHash = {};
    const docSetArray = [];
    const queryTokens = this.tokenizer.tokenize(query);
    const maxScore = Utils.maxScore(query, this.tokenizer, prefixBoost);
    if ((options != null ? scoreThreshold : void 0) == null) {
      minScore = 0.5 * maxScore;
      minNumQueryTokens = Math.ceil(queryTokens.length * 0.5);
    } else if ((options != null ? scoreThreshold : void 0) <= 0) {
      minScore = 0;
      minNumQueryTokens = queryTokens.length;
    } else if ((options != null ? scoreThreshold : void 0) >= 1) {
      minScore = maxScore;
      minNumQueryTokens = 0;
    } else {
      minScore = scoreThreshold * maxScore;
      minNumQueryTokens = Math.ceil(queryTokens.length * (1 - scoreThreshold));
    }
    const hasSomeToken = queryTokens.some(function(token) {
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
      let docRef, startMatchTime, startVariantMatch;
      if (this.loggingOn) startMatchTime = Utils.logTiming(`'${token}' score start`);
      // name matches
      for (docRef in this.tokenStore.get(token, false)) {
        switch (false) {
          case !((docSetHash[docRef] == null) && i <= minNumQueryTokens):
            docSetHash[docRef] = Utils.tokenScore(token, false, prefixBoost);
            break;
          case docSetHash[docRef] == null:
            docSetHash[docRef] += Utils.tokenScore(token, false, prefixBoost);
        }
      }
      if (this.loggingOn) {
        startVariantMatch = Utils.logTiming(`\t\toriginal name:\t\t${Object.keys(this.tokenStore.get(token, false)).length} `, startMatchTime);
      }
      // variant matches
      for (docRef in this.tokenStore.get(token, true)) {
        switch (false) {
          case !((docSetHash[docRef] == null) && i <= minNumQueryTokens):
            docSetHash[docRef] = Utils.tokenScore(token, true, prefixBoost);
            break;
          case docSetHash[docRef] == null:
            docSetHash[docRef] += Utils.tokenScore(token, true, prefixBoost);
        }
      }
      if (this.loggingOn) {
        Utils.logTiming(`\t\tvariant matches:\t${Object.keys(this.tokenStore.get(token, true)).length} `, startVariantMatch);
      }
    }), this);
    // convert hash to array of hashes for sorting
    // filter out results below the minScore
    // boost exact matches - consciously does not convert diacritics, but uncertain whether that's best
    const startHashArray = new Date();
    if (this.loggingOn) Utils.logTiming('hash to sorted array\n');
    for (let key in docSetHash) {
      if (docSetHash[key] >= minScore) {
        // exact match?
        const exactMatch = Utils.normalizeString(query) === Utils.normalizeString(this.metaStore.get(key).name) ? true : false;
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
    const startArraySort = new Date();
    docSetArray.sort(function(a, b) {
      let compareObjects;
      // Determines sort value (-1, 0, 1) based on data type and sort order
      // stolen from nectar
      compareObjects = function(a, b, property, order) {
        let aprop, bprop, ref, ref1, ref2, ref3, sortOrder;
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
    const results = docSetArray.slice(offset, numResults);
    if (this.loggingOn) {
      Utils.debugLog('**********');
      Utils.debugLog("score\tname (id)");
    }
    const resultSet = results.map(function(result, i, results) {
      result = this.metaStore.get(result.id);
      result.score = Math.round(results[i].score * 10) / 10;
      if (this.loggingOn) Utils.debugLog(`${result.score}\t${result.name} (${result.id})`);
      return result;
    }, this);
    const finishTime = new Date();
    callback(resultSet, {
      hbTotalTime: finishTime - startTime,
      findDocsTime: startHashArray - startTime,
      hashToArrayTime: startArraySort - startHashArray,
      sortArrayTime: finishTime - startArraySort
    });
    if (this.loggingOn) {
      Utils.logTiming('SUMMARY:');
      Utils.debugLog("");
      Utils.debugLog(`hash size:\t${Object.keys(docSetHash).length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
      Utils.debugLog(`array size:\t${docSetArray.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
      Utils.debugLog(`min score:\t${minScore}`);
      Utils.debugLog(`max score:\t${maxScore}`);
      Utils.debugLog(`query time:\t${finishTime - startTime} ms`);
      Utils.debugLog(`\t\t${startHashArray - startTime} ms - finding docs`);
      Utils.debugLog(`\t\t${startArraySort - startHashArray} ms - sorting array`);
      Utils.debugLog(`\t\t${finishTime - startArraySort} ms - hash to array`);
      return Utils.debugLog("***************");
    }
  };
};
