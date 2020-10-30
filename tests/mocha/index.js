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
    it("should now have 3 docs in the metaStore", function () {
      assert.equal(Object.keys(idx.metaStore.root).length, 3);
    });
  });

  describe("adding a document that already exists", function () {
    before(function () {
      idx.add({id: 2, desc: "Mr", name: "Steven", title: "male"});
    });
    it("should still contain only 11 trigrams in the token store", function () {
      assert.equal(Object.keys(idx.tokenStore.root).length,11);
    });
    it("should still have 'ste' as a token in the store", function () {
      assert.ok(idx.tokenStore.get("ste",false));
    });
    it("should still have only one document containing 'ste'", function () {
      assert.equal(Object.keys(idx.tokenStore.get("ste")).length, 2);
    });
    it("should still have only 3 docs in the metaStore", function () {
      assert.equal(Object.keys(idx.metaStore.root).length, 3);
    });
  });

  describe("triggering add events", function () {
    const doc = {id: 4, name: 'this is a test'};
    let callbackCalled = false;
    let callbackArgs = [];

    before(function () {
      idx.on('add', function (doc, index) {
        callbackCalled = true
        callbackArgs = Array.prototype.slice.call(arguments)
      });
    });

    it("should not be triggered before a doc is added", function () {
      assert.ok(!callbackCalled);
      assert.equal(callbackArgs.length, 0);
    });

    it("should trigger an event after a doc is added", function () {
      assert(doc, JSON.stringify(doc));
      idx.add(doc);
      assert.ok(callbackCalled);
      assert.equal(callbackArgs.length, 2);
      assert.deepEqual(callbackArgs[0], doc)
      assert.deepEqual(callbackArgs[1], idx)
    });

  });
});
