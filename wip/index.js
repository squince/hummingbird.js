export class Index {
  constructor(variantsObj) {
    this.createTime = new Date();
    this.lastUpdate = null;
    this.variantStore = variantsObj ?  {...variantsObj} : {};
  }
};
