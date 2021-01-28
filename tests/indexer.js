import Index from '../src/indexer.mjs';
import assert from 'assert';

describe('Hummingbird Indexer', function () {
  let idx, callbackCalled, callbackArgs;
  const startOfStringIndicator = '\u0002';
  const doc1 = { id: 1, desc: 'some meta data without a name field', title: 'noname doc' };
  const doc2 = { id: 2, desc: 'Mr', name: 'Steven', title: 'male' };
  const doc3 = { id: 3, desc: 'Mrs', name: 'Stephanie', title: 'female' };

  beforeEach(function () {
    idx = new Index();
    addCallbackCalled = false;
    removeCallbackCalled = false;
    updateCallbackCalled = false;
    callbackArgs = [];

    idx.on('add', function (doc, index) {
      addCallbackCalled = true;
      callbackArgs = Array.prototype.slice.call(arguments);
    });

    idx.on('remove', function (doc, index) {
      removeCallbackCalled = true;
      callbackArgs = Array.prototype.slice.call(arguments);
    });

    idx.on('update', function (doc, index) {
      updateCallbackCalled = true;
      callbackArgs = Array.prototype.slice.call(arguments);
    });
  });

  describe('adding a document with no name field', function () {
    beforeEach(function () {
      idx.add(doc1);
    });

    it('will populate the meta data store', function () {
      assert.equal(Object.keys(idx.metaStore.root).length, 1);
    });

    it('will leave the token store empty', function () {
      assert.equal(Object.keys(idx.tokenStore.root).length, 0);
    });
  });

  describe('adding one or more documents having a name field', function () {
    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3);
    });

    it('should have the most recently added document, and the index as the event callback arguments', function () {
      assert.deepEqual(callbackArgs[0], doc3);
      assert.deepEqual(callbackArgs[1], idx);
    });

    it('should create trigrams in the token store', function () {
      const tokens = Object.keys(idx.tokenStore.root).sort();
      const firstToken = startOfStringIndicator.concat('st');
      assert.equal(tokens.length, 11);
      assert.deepEqual(tokens, [firstToken, 'ani', 'eph', 'eve', 'han', 'nie', 'pha', 'ste', 'tep', 'tev', 'ven']);
    });

    it("should have 2 documents containing 'ste'", function () {
      assert.equal(Object.keys(idx.tokenStore.get('ste')).length, 2);
    });

    it('should have 2 docs in the metaStore', function () {
      assert.equal(Object.keys(idx.metaStore.root).length, 2);
    });
  });

  describe('triggering events', function () {
    const TRIGGER_EVENT = true;
    const doc02 = Object.assign({}, doc2, { name: 'foo' });
    const doc03 = Object.assign({}, doc3, { name: 'bar' });

    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3, TRIGGER_EVENT);
    });

    afterEach(function () {
      addCallbackCalled = false;
      removeCallbackCalled = false;
      updateCallbackCalled = false;
      callbackArgs = [];
    });

    it('should trigger an event after a doc is added', function () {
      assert.equal(addCallbackCalled, true);
      assert.equal(callbackArgs.length, 2);
      assert.deepEqual(callbackArgs[0], doc3);
      assert.deepEqual(callbackArgs[1], idx);
    });

    it('should trigger an event after the doc is removed', function () {
      idx.remove(doc2.id);
      idx.remove(doc3.id, TRIGGER_EVENT);
      assert.equal(removeCallbackCalled, true);
      assert.equal(callbackArgs.length, 2);
      assert.notDeepEqual(callbackArgs[0], doc3);
      assert.deepEqual(callbackArgs[1], idx);
    });

    it('should trigger an event after the doc is updated', function () {
      idx.update(doc02);
      idx.update(doc03);
      assert.equal(updateCallbackCalled, true);
      assert.equal(callbackArgs.length, 2);
      assert.notDeepEqual(callbackArgs[0], doc3);
      assert.deepEqual(callbackArgs[0], doc03);
      assert.deepEqual(callbackArgs[1], idx);
    });
  });

  describe('silencing events', function () {
    const TRIGGER_EVENT = false;
    const doc02 = Object.assign({}, doc2, { name: 'foo' });
    const doc03 = Object.assign({}, doc3, { name: 'bar' });

    beforeEach(function () {
      idx.add(doc2, TRIGGER_EVENT);
      idx.add(doc3, TRIGGER_EVENT);
    });

    afterEach(function () {
      addCallbackCalled = false;
      removeCallbackCalled = false;
      updateCallbackCalled = false;
      callbackArgs = [];
    });

    it('should NOT trigger an event after a doc is added', function () {
      assert.notEqual(addCallbackCalled, true);
    });

    it('should NOT trigger an event after the doc is removed', function () {
      idx.remove(doc2.id, TRIGGER_EVENT);
      idx.remove(doc3.id, TRIGGER_EVENT);
      assert.notEqual(removeCallbackCalled, true);
    });

    it('should NOT trigger an event after the doc is updated', function () {
      idx.update(doc02, TRIGGER_EVENT);
      idx.update(doc03, TRIGGER_EVENT);
      assert.notEqual(updateCallbackCalled, true);
    });
  });

  describe('adding a document that already exists', function () {
    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3);
    });

    it('should not change the token nor meta stores', function () {
      assert.equal(Object.keys(idx.tokenStore.root).length, 11);
      assert.equal(Object.keys(idx.metaStore.root).length, 2);
      idx.add(doc2);
      assert.equal(Object.keys(idx.tokenStore.root).length, 11);
      assert.equal(Object.keys(idx.metaStore.root).length, 2);
    });

    it("should still have 'ste' as a token in the store", function () {
      idx.add(doc2);
      assert.ok(idx.tokenStore.get('ste', false));
    });

    it("should still have only two documents containing 'ste'", function () {
      idx.add(doc2);
      assert.equal(Object.keys(idx.tokenStore.get('ste')).length, 2);
    });

    it('should still have only 2 docs in the metaStore', function () {
      idx.add(doc2);
      assert.equal(Object.keys(idx.metaStore.root).length, 2);
    });
  });

  describe('removing a document', function () {
    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3);
    });

    it('should not have the document in the index stores after it is removed', function () {
      assert.equal(Object.keys(idx.tokenStore.get('ste')).length, 2);
      idx.remove(doc2.id);
      assert.notEqual(idx.metaStore.has(doc2.id), true);
      assert.equal(idx.metaStore.has(doc3.id), true);
      assert.equal(idx.tokenStore.has('ste'), true);
      assert.equal(Object.keys(idx.tokenStore.get('ste')).length, 1);
    });
  });

  describe('removing a non-existent document', function () {
    const doc = { id: 99, name: 'I dont exist' };

    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3);
    });

    it('should not have the non-existent document ID in the metaStore', function () {
      assert.equal(idx.metaStore.has(99), false);
    });

    it('should have other documents in the index', function () {
      assert.equal(idx.metaStore.has(2), true);
    });

    it('should not trigger an event removing the non-existent document', function () {
      idx.remove(doc.id);
      assert.equal(idx.metaStore.has(99), false);
      assert.ok(!removeCallbackCalled);
    });
  });

  describe('updating a document', function () {
    const doc02 = Object.assign({}, doc2, { name: 'foo' });
    const doc03 = Object.assign({}, doc3, { name: 'bar' });

    beforeEach(function () {
      idx.add(doc2);
      idx.add(doc3);
    });

    it('should have a couple of documents in the index before update', function () {
      assert.equal(idx.tokenStore.has('ste'), true);
      assert.ok(idx.metaStore.has(2));
      assert.notEqual(idx.tokenStore.has('bar'), true);
    });

    it('should replace the name in the index after updating the same doc ID', function () {
      idx.update(doc02);
      idx.update(doc03);

      assert.equal(idx.tokenStore.has('bar'), true);
      assert.notEqual(idx.tokenStore.has('ste'), true);
    });

    it('should have the same number of documents in the index as before the update', function () {
      idx.update(doc02);
      idx.update(doc03);

      assert.equal(idx.metaStore.has(2), true);
    });
  });
});
