import Index from './indexer.mjs';

export default class Hummingbird {
  constructor(variantsObj) {
    this.idx = new Index(variantsObj);

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

  Index() {
    return this.idx;
  };

  load(serializedData) {

  }
};
