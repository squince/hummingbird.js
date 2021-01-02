import hum from "../main.js";
import assert from "assert".strict;

describe("Hummingbird Token Store", function () {
  let store;
  const startOfStringIndicator = "\u0002";
  const doc1 = {id: 123, token: "foo"};
  const doc2 = {id: 456, token: "foo"};
  const doc3 = {id: 789, token: "bar"};

  beforeEach(function () {
    store = new hum.TokenStore;
  });

  describe('adding a token to the store', function () {
    beforeEach(function () {
      store.add(doc1.token, false, doc1.id);
    });

    it('should result in the token store containing the token', function () {
      assert.ok(store.has(doc1.token));
    });

    it('should associate the token with the doc ID', function () {
      assert.equal(store.root[doc1.token].n[doc1.id], 1);
    });

    it('should associate the token with only one doc ID', function () {
      assert.equal(Object.keys(store.root['foo'].n).length, 1);
    });

    it('should serialize to JSON', function () {
      const storeJson = {};
      storeJson['root'] = {};
      storeJson['root'][doc1.token] = {};
      storeJson['root'][doc1.token]['n'] = {};
      storeJson['root'][doc1.token]['n'][doc1.id] = 1;

      assert.deepEqual(store.toJSON(), storeJson);
    });
  });

  describe('adding 2 documents to the token in the store', function () {
    beforeEach(function () {
      store.add(doc1.token, false, doc1.id);
      store.add(doc2.token, false, doc2.id);
    });

    it('should result in the token store containing the token', function () {
      assert.ok(store.has(doc1.token));
      assert.ok(store.has(doc2.token));
    });

    it('should associate the token with 2 doc IDs', function () {
      assert.equal(store.count(doc1.token), 2)
      assert.equal(Object.keys(store.root[doc1.token].n).length, 2);
      assert.ok(store.root[doc1.token].n.hasOwnProperty(doc1.id.toString()));
      assert.ok(store.root[doc2.token].n.hasOwnProperty(doc2.id.toString()));
    });

    it('should not have a token that was never added', function () {
      assert.equal(store.count(doc3.token), 0)
      assert.equal(store.has(doc3.token), false);
    });
  });

  describe('retrieving a token from the store', function () {
    beforeEach(function () {
      store.add(doc1.token, false, doc1.id);
    });

    it('should return only associated document ID(s)', function () {
      const tokDocObj = {};
      tokDocObj[doc1.id] = 1;

      assert.deepEqual(store.get(doc1.token), tokDocObj);
      assert.deepEqual(store.get(doc3.token), {});
    });
  });

  describe('removing a document from the token store', function () {
    const tokDoc1Obj = {};
    const tokDoc2Obj = {};
    let tokDocObj;

    beforeEach(function () {
      store.add(doc1.token, false, doc1.id);
      store.add(doc2.token, false, doc2.id);

      tokDoc1Obj[doc1.id] = 1;
      tokDoc2Obj[doc2.id] = 1;
      tokDocObj = { ...tokDoc1Obj, ...tokDoc2Obj };
    });

    it('should decrement the document count for the associated token', function () {
      assert.deepEqual(store.get(doc1.token), tokDocObj);
      assert.equal(store.count(doc1.token), 2);
      store.remove(doc1.id);
      assert.deepEqual(store.get(doc2.token), tokDoc2Obj);
      assert.equal(store.has(doc2.token), true);
      assert.equal(store.count(doc2.token), 1);
    });

    it('should have no impact if the document is not in the store', function () {
      assert.deepEqual(store.get(doc1.token), tokDocObj);
      store.remove(doc3.id);
      assert.deepEqual(store.get(doc1.token), tokDocObj);
    });
  });

  describe('loading a serialized token store', function () {
    beforeEach(function () {
      store.add(doc1.token, false, doc1.id);
    });

    it('should properly hydrate a new token store', function () {
      assert.equal(store.has(doc1.token), true);
      const newStore = hum.TokenStore.load(store.toJSON());
      assert.deepEqual(newStore, store);
      assert.equal(newStore.has(doc1.token), true);
    });
  });
});

