import Index from './indexer.mjs';
import Tokenizer from './tokenizer.mjs';
import * as Utils from "./utils.mjs";

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

  /** load
   * Loads serialized index and issues a warning if the index being imported is in a different format
   * than what is now supported by this version of Humminbird
  */
  load(serializedData) {
    const {index_version, variantStore, tokenStore, metaStore, createTime, lastUpdate} = serializedData;
    if (serializedData.index_version !== this.index_version) {
      Utils.warn(`version mismatch: current ${this.index_version}, importing ${serializedData.index_version}`);
    }
    serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
    this.idx = Index.load({ tokenStore, metaStore, createTime, lastUpdate });
  };

  search(query, cb, opts) {
    // Index.load
    return this.idx.search(query, cb, opts);
  };

  add(doc, emitEvent) {
    // Index.add
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
};
