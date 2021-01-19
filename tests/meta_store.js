import hum from "../src/hummingbird.mjs";
import assert from "assert";

describe("Hummingbird Meta Store", function () {
  let store;

  beforeEach(function () {
    store = new hum.MetaStore;
  });

  describe('adding empty meta object to the store', function () {
    const doc = {
      id:'123',
      name: 'test'
    };

    beforeEach(function () {
      store.add(doc);
    });

    it("should put the doc in the meta store", function () {
      assert.ok(doc.id in store.root);
      assert.deepEqual(store.root[doc.id], doc);
    });

    it("should return an object with only ID and Name properties", function () {
      const obj = store.get(doc.id);
      assert.ok(typeof obj === 'object');
      assert.equal(Object.keys(obj).length, 2);
    });
  });

  describe('adding non-empty doc to the store', function () {
    const doc = {
      id:'123',
      name: 'test',
      fname:'fred',
      lname:'smith',
      title: 'boss of the world'
    };

    beforeEach(function () {
      store.add(doc);
    });

    it("should include all the document properties in the store for that doc ID", function () {
      const obj = store.root['123'];
      assert.deepEqual(obj, doc);
    });

    it("should return the doc when requested", function () {
      const obj = store.get(doc.id);
      assert.deepEqual(obj, doc);
    });
  });

  describe('removing a doc from the meta store', function () {
    const doc = {
      id:'123',
      name: 'test',
      foo: 'bar'
    };

    beforeEach(function () {
      store.add(doc);
    });

    it("will eliminate the doc ID as a key from the store", function () {
      assert.ok(doc.id in store.root);
      assert.deepEqual(store.root[doc.id], doc);
      store.remove(doc.id);
      assert.ok(!(doc.id in store.root));
      assert.notDeepEqual(store.root[doc.id], doc);
    });
  });
});
