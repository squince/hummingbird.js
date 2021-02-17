import Index from './indexer.mjs';
import Tokenizer from './tokenizer.mjs';
import * as Utils from "./utils.mjs";

/**
 * @class Hummingbird
 * @classdesc The API namespace for making names searchable and returning appropriately
 * ordered fuzzy matched names based on supplied partial strings.
 * @param {object} variantsObj - a hash whose keys are intended to be standarized names and who
   values are those names' synonyms (i.e., nicknames, alternate spellings, acronyms, and
   abbreviates)
 * @param {object} opts - {min, max} properties that constrain the character length of tokens
   (i.e., the substrings used for finding matches)
*/
export default class Hummingbird {
  constructor(variantsObj, opts) {
    this.tokenizer = new Tokenizer(opts);
    this.idx = new Index(variantsObj, this.tokenizer);

    // .loggingOn
    // Set to true or false to enable or disable logging respectively
    // Defaults to false
    this.loggingOn = false;

    // .version
    // Version of the hummingbird code base
    this.version = '2.2.0';

    // .index_version
    // Version of the index data structure
    this.index_version = '5.0';
  };

  /**
   * @memberOf Hummingbird
   * @instance
   * @function load - Loads serialized index and issues a warning if the index being imported is in a different format
     than what is now supported by this version of Humminbird
   * @param {object} serializedData
      version,
      index_version,
      createTime,
      lastUpdate
      metaStore,
      tokenStore,
      variantStore,
  */
  load(serializedData) {
    const {index_version, variantStore, tokenStore, metaStore, createTime, lastUpdate} = serializedData;
    if (serializedData.index_version !== this.index_version) {
      Utils.warn(`version mismatch: current ${this.index_version}, importing ${serializedData.index_version}`);
    }
    serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
    this.idx = Index.load({ tokenStore, metaStore, createTime, lastUpdate });
  };

  /** add
   * Add a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
   * Takes an Object as an argument.
   * _doc.id_ = must be a unique identifier within a given index

   * Then, there are two options in order to have something to search:
   * _doc.name_ = this string will be indexed

   * Optionally includes additional arbitrary name-value pairs to be stored, but not indexed
  */
  add(doc, emitEvent) {
    // Index.add
    this.idx.add({doc, emitEvent, loggingOn: this.loggingOn});
  };

  update(doc, emitEvent) {
    // Index.update
  };

  remove(docRef, emitEvent) {
    // Index.remove
  };

  // toJSON
  // Returns a representation of the index ready for serialization.
  toJSON() {
    return {
      version: this.version,
      index_version: this.index_version,
      tokenStore: this.idx.tokenStore.toJSON(),
      metaStore: this.idx.metaStore.toJSON(),
      variantStore: this.idx.variantStore.toJSON(),
      createTime: this.idx.createTime.getTime(),
      lastUpdate: this.idx.lastUpdate?.getTime()
    };
  };

  search(query, cb, opts) {
    // Index.load
    return this.idx.search(query, cb, opts);
  };
};
