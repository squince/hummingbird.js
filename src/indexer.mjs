import EventEmitter from './event_emitter.mjs';
import MetaStore from './meta_store.mjs';
import TokenStore from './token_store.mjs';
import VariantStore from './variant_store.mjs';
import * as Utils from "./utils.mjs";
import { getMatchingDocs } from "./searcher.mjs";
import { orderResultSet } from "./sorter.mjs"

/* Indexer
 * The object that contains the inverted index of tokens
 * found in each name in the corpus, associated meta data, and methods
 * for interacting with the data
*/
export default class Indexer {
  constructor(variantsObj, tokenizer, loggingOn) {
    this.createTime = new Date();
    this.lastUpdate = null;
    this.loggingOn = loggingOn;
    this.eventEmitter = new EventEmitter();
    this.metaStore = new MetaStore();
    this.tokenStore = new TokenStore();
    this.variantStore = variantsObj ?
      new VariantStore(variantsObj) :
      new VariantStore();
    this.tokenizer = tokenizer;

    this.augmentWithMetaData = (results) => {
      return results.map(function(result, i, results) {
        result = this.metaStore.get(result.id);
        result.score = Math.round(results[i].score * 10) / 10;
        if (this.loggingOn || loggingOn) Utils.debugLog(`${result.score}\t${result.name} (${result.id})`);
        return result;
      }, this);
    };
  }

  /* on
   * Binds handler to events emitted by the index
  */
  on(eventName, handler) {
    return this.eventEmitter.addListener({eventName, fn: handler});
  };

  /* off
   * Removes handler from event emitted by the index
  */
  off(eventName, handler) {
    return this.eventEmitter.removeListener({eventName, fn: handler});
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
  add({doc, emitEvent=true}) {
    if (this.metaStore.has(doc.id)) {
      if (this.loggingOn) Utils.debugLog(`Document ${doc.id} already indexed, replacing`);
      this.update(doc, emitEvent);
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
    if (!doc) return;

    if (!(doc.name) && this.loggingOn) {
      Utils.debugLog(`No 'name' property in doc\n${JSON.stringify(doc)}`);
      return;
    }

    let tokens = this.tokenizer.tokenize(doc.name);

    // tokenize the doc
    let variant_tokens = this.variantStore.getVariantTokens({
      name: doc.name,
      tokenizer: this.tokenizer,
      tokens: this.tokenizer.tokenize(doc.name)
    });

    // add the name tokens to the tokenStore
    // do this before variant tokens are added to ensure tokens are distinct
    for (const token of tokens) {
      this.tokenStore.add(token, false, doc.id);
    }

    // add the variant tokens to the tokenStore
    for (const token of variant_tokens) {
      this.tokenStore.add(token, true, doc.id);
    }
  };

  // remove
  // Removes the document from the index that is referenced by the 'id' property.
  remove(docRef, emitEvent=true) {
    if (this.metaStore.has(docRef)) {
      //Only check the tokens for the doc name - don't loop over all tokens.
      this.tokenStore.remove(docRef, this.tokenizer.tokenize(this.metaStore.get(docRef).name));
      this.metaStore.remove(docRef);
      this.lastupdate = new Date();
      if (emitEvent) this.eventEmitter.emit('remove', docRef, this);
    }
  };

  // update
  // Updates the document from the index that is referenced by the 'id' property
  // In case the name has changed, we remove the old tokens and retokenize.
  // Otherwise, we just update the metaStore.
  update(doc, emitEvent=true) {
    if (this.metaStore.has(doc.id)) {
      //Has the name changed?
      if (doc.name !== this.metaStore.get(doc.id).name) {
        this.remove(doc.id, false);
        this.tokenizeDoc(doc);
      } else {
        this.metaStore.remove(doc.id);
      }
      this.metaStore.add(doc);
      if (emitEvent) this.eventEmitter.emit('update', doc, this);
    }
  };

  // search
  // Takes a callback function that has the resultSet array and a profile object as arguments.
  // Optionally, takes an options object
  // Finds matching names and returns them in order of best match.
  // TODO: callback needs to take a single object that has both results and diagnostics
  search(query, callback, options={}) {
    const startTime = new Date();
    const {
      loggingOn=false
      , howMany=10
      , startPos=0
      , boostPrefix=true
      , secondarySortField='name'
      , secondarySortOrder='asc'
      , scoreThreshold=0.5
    } = options;

    if (this.loggingOn) Utils.logTiming('find matching docs');

    if ((query == null) || query.length < (this.tokenizer.min - 1)) {
      callback([], { hbTotalTime: new Date() - startTime });
      return;
    }

    const queryTokens = this.tokenizer.tokenize(query);
    const queryTokensLength = queryTokens.length;
    const maxScore = Utils.maxScore(query, this.tokenizer, boostPrefix);
    const { minScore, minNumQueryTokens } = Utils.setMinThresholds({ scoreThreshold, queryTokensLength, maxScore });
    const hasSomeToken = queryTokens.some( (token) => this.tokenStore.has(token) );

    if (!hasSomeToken) {
      callback([], { hbTotalTime: new Date() - startTime });
      return;
    }

    const { tokenStore } = this;
    const matchOptions = { boostPrefix, loggingOn: this.loggingOn || loggingOn, minNumQueryTokens }

    // retrieve docs from tokenStore
    const docSetHash = getMatchingDocs({queryTokens, tokenStore, matchOptions});

    // order results by score
    const { orderedResults, startHashArray, startArraySort } = orderResultSet({
      query
      , docSetHash
      , metaStore: this.metaStore
      , minScore
      , secondarySortField
      , secondarySortOrder
      , loggingOn: this.loggingOn
    });

    // no point in taking time to add meta data to docs that won't be returned
    const results = orderedResults.slice(startPos, howMany);

    if (this.loggingOn || loggingOn) {
      Utils.debugLog('**********');
      Utils.debugLog("score\tname (id)");
    }

    // augment return set with meta
    const resultSet = this.augmentWithMetaData(results);

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
      Utils.debugLog(`array size:\t${orderedResults.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
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
