import Index from './indexer.mjs';

export default class hummingbird {
  constructor(variantsObj) {
    this.idx = new Index(variantsObj);

    // .loggingOn
    // Set to true or false to enable or disable logging respectively
    // Defaults to false
    this.loggingOn = false;

    // .version
    // Version of the hummingbird code base
    this.version = '@@VERSION';

    // .index_version
    // Version of the index data structure
    this.index_version = '@@INDEX_VERSION';
  }

  get EventEmitter() {
    return this.eventEmitter;
  }

  get Index() {
    return this.idx;
  }

  get MetaStore() {
    return this.idx.metaStore;
  }

  get Tokenizer() {
    return this.idx.tokenizer;
  }

  get TokenStore() {
    return this.idx.tokenStore;
  }

  get VariantStore() {
    return this.idx.variantStore;
  }
}
