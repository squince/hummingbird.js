import Index from './indexer.mjs';
import Tokenizer from './tokenizer.mjs';
import * as Utils from "./utils.mjs";

/**
 * The API namespace for making names searchable and returning
   appropriately ordered fuzzy matched names based on supplied partial strings.
*/
export default class Hummingbird {
  /**
    * @param {object} variantsObj - a hash whose keys are intended to be standarized names and who
      values are those names' synonyms (i.e., nicknames, alternate spellings, acronyms, and
      abbreviates)
    * @param {object} opts configures the tokenizer
    * @param opts.min {int} sets the minimum number of characters per token
    * @param opts.max {int} limits the maximum number of characters per token
  */
  constructor(variantsObj, opts, loggingOn) {
    this.tokenizer = new Tokenizer(opts);
    this.idx = new Index(variantsObj, this.tokenizer, loggingOn);

    // Set to true or false to enable or disable logging respectively
    // Defaults to false
    this.loggingOn = loggingOn;

    // .version
    // Version of the hummingbird code base
    this.version = '2.2.0';

    // .index_version
    // Version of the index data structure
    this.index_version = '5.0';
  };

  /**
    * Loads serialized index and issues a warning if the index being imported is in a different format
      than what is now supported by this version of Humminbird
    * @param {object} serializedData
    * @param {string} serializedData.version
    * @param {string} serializedData.index_version
    * @param {string} serializedData.createTime
    * @param {string} serializedData.lastUpdate
    * @param {string} serializedData.metaStore
    * @param {string} serializedData.tokenStore
    * @param {string} serializedData.variantStore
  */
  load(serializedData) {
    const {index_version, variantStore: {variants}, tokenStore, metaStore, createTime, lastUpdate} = typeof serializedData === 'object' ? serializedData : JSON.parse(serializedData);
    this.idx = new Index(variants, this.tokenizer);
    if (index_version !== this.index_version) {
      Utils.warn(`version mismatch: current ${this.index_version}, importing ${serializedData.index_version}`);
    }
    this.idx.load({ tokenStore, metaStore, createTime, lastUpdate });
  };

  /**
    * Adds a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
    * @param {object} doc - includes additional arbitrary name-value pairs to be returned but not searched
    * @param {string} doc.id - must be a unique identifier within a given index
    * @param {string} doc.name - string representing a name to be indexed
    * @param {any_type} doc.arbitrary_key - meta data value to be returned with doc in search results
    * @param {boolean} [emitEvent=true] - whether to emit an event upon successful execution
  */
  add(doc, emitEvent=true) {
    this.idx.add({doc, emitEvent});
  };

  /**
    Updates the document from the index that is referenced by the 'id' property
    In case the name has changed, we remove the old tokens and retokenize.
    Otherwise, we just update the metaStore.
    * @param {object} doc - includes additional arbitrary name-value pairs to be returned but not searched
    * @param {string} doc.id - must be a unique identifier within a given index
    * @param {string} doc.name - string representing a name to be indexed
    * @param {any_type} doc.arbitrary_key - meta data value to be returned with doc in search results
    * @param {boolean} [emitEvent=true] - whether to emit an event upon successful execution
  */
  update(doc, emitEvent=true) {
    this.idx.update(doc, emitEvent);
  };

  /**
    * Removes the document from the index that is referenced by the 'id' property.
    * @param {string} docRef - must be a unique identifier within a given index
    * @param {boolean} [emitEvent=true] - whether to emit an event upon successful execution
  */
  remove(docRef, emitEvent=true) {
    this.idx.remove(docRef, emitEvent);
  };

  /**
    * Returns a representation of the index ready for serialization.
  */
  serialize() {
    return {
      version: this.version,
      index_version: this.index_version,
      tokenStore: this.idx.tokenStore,
      metaStore: this.idx.metaStore,
      variantStore: this.idx.variantStore,
      createTime: this.idx.createTime.getTime(),
      lastUpdate: this.idx.lastUpdate?.getTime()
    };
  };

  /**
    Finds matching names and returns them in order of best match.
   * @param {string} query - the string against which matches will be returned
   * @param {function} callback - a function that takes the resultSet array and a profile object as arguments
   * @param {object} [opts] - an options object with properties that influence the results properties
   * @param {int} opts.howMany=10 - the maximum number of results to be returned
   * @param {int} opts.startPos=0 - how far into the sorted matched set should the returned resultset start
   * @param {float} opts.scoreThreshold=0.5 - (number between 0,1 inclusive) only matches with a score equal to or greater
     than this fraction of the maximum theoretical score will be returned in the result set
   * @param {boolean} opts.boostPrefix=true - whether an additional boost applies to results that start with the first query token
   * @param {string} opts.secondarySortField='name' - if provided, results are sorted first by score descending, then by the property represented by this string
   * @param {string} opts.secondarySortOrder='asc' - ('asc' or 'desc') optionally specifies whether sort on secondarySortField is ascending or descending
  */
  search(query, cb, options) {
    return this.idx.search(query, cb, options);
  };
};
