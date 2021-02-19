import Index from './indexer.mjs';
import Tokenizer from './tokenizer.mjs';
import * as Utils from "./utils.mjs";

/**
 * The API namespace for making names searchable and returning
   appropriately ordered fuzzy matched names based on supplied partial strings.
*/
class Hummingbird {
  /**
   * @param {object} variantsObj - a hash whose keys are intended to be standarized names and who
     values are those names' synonyms (i.e., nicknames, alternate spellings, acronyms, and
     abbreviates)
   * @param {object} opts configures the tokenizer
   * @param opts.min {int} sets the minimum number of characters per token
   * @param opts.max {int} limits the maximum number of characters per token
  */
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
    const {index_version, variantStore, tokenStore, metaStore, createTime, lastUpdate} = serializedData;
    if (serializedData.index_version !== this.index_version) {
      Utils.warn(`version mismatch: current ${this.index_version}, importing ${serializedData.index_version}`);
    }
    serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
    this.idx = Index.load({ tokenStore, metaStore, createTime, lastUpdate });
  };

  /**
   * Adds a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
   * @param {object} doc includes additional arbitrary name-value pairs to be returned but not searched
   * @param {string} doc.id must be a unique identifier within a given index
   * @param {string} doc.name string representing a name to be indexed
   * @param {any_type} doc.arbitrary_key meta data value to be returned with doc in search results
  */
  add(doc, emitEvent) {
    // Index.add
    this.idx.add({doc, emitEvent, loggingOn: this.loggingOn});
  };

  /**
    Updates the document from the index that is referenced by the 'id' property
    In case the name has changed, we remove the old tokens and retokenize.
    Otherwise, we just update the metaStore.
  */
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
