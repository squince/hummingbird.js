const hum = require("../../hummingbird.js");
const assert = require("assert").strict;

describe("Hummingbird Index", function () {
  const idx = new hum.Index;

  describe("adding a document with no name field", function () {
    before(function () {
      const doc = {id: 1, desc: "some meta data without a name field", title: "noname doc"};
      idx.add(doc);
    });

    it("will populate the meta data store", function () {
      assert.equal(Object.keys(idx.metaStore.root).length,1);
    });
    it("will leave the token store empty", function () {
      assert.equal(Object.keys(idx.tokenStore.root).length,0);
    });
  });

  describe("adding a document with a name field", function () {
    before(function () {
      idx.add({id: 2, desc: "Mr", name: "Steven", title: "male"});
      idx.add({id: 3, desc: "Mrs", name: "Stephanie", title: "female"});
    });
    it("should create 11 trigrams in the token store", function () {
      assert.equal(Object.keys(idx.tokenStore.root).length,11);
    });
    it("should have 'ste' as a token in the store", function () {
      assert.ok(idx.tokenStore.get("ste",false));
    });
    it("should have only one document containing 'ste'", function () {
      assert.equal(Object.keys(idx.tokenStore.get("ste")).length, 2);
    });
    //TODO: maybe we should prevent metaStore entries if no name property?
    it("should now have 3 docs in the metaStore", function () {
      assert.equal(Object.keys(idx.metaStore.root).length, 3);
    });
  });
});
