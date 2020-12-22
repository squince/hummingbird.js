//import Index from './index.js';

export class Hummingbird {
  constructor(variantsObj) {
    //this.Index = Index;
    this.idx = {foo: 'bar'};
  }

  get idx() {
    return this.idx;
  };

  get loggingOn() {
    return false
  };

  get version() {
    return "@@VERSION"
  };;

  get index_version() {
    "@@INDEX_VERSION";
  };
};
