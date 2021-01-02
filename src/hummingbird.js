// import "./indexer.js";

export default class hummingbird {
  constructor(variantsObj) {
    this.idx = new Index(variantsObj);

    // .loggingOn
    // Set to true or false to enable or disable logging respectively
    // Defaults to false
    this.loggingOn = false;

    // .version
    // Version of the hummingbird code base
    this.version = "@@VERSION";

    // .index_version
    // Version of the index data structure
    this.index_version = "@@INDEX_VERSION";
  };
};
