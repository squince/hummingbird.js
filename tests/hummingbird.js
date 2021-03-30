import Hummingbird from '../src/hummingbird.mjs';
import assert from 'assert';

describe('Hummingbird API', function () {
  let hum, variantsObj;
  const loggingOn = false;
  const startOfStringIndicator = '\u0002';
  const doc1 = { id: 1, desc: 'some meta data without a name field', title: 'noname doc' };
  const doc2 = { id: 2, desc: 'Mr', name: 'Steven', title: 'male' };
  const doc3 = { id: 3, desc: 'Mrs', name: 'Stephanie', title: 'female' };

  describe('populating an index with a doc having no name property', function () {
    beforeEach(function () {
      hum = new Hummingbird();
      hum.add(doc1);
    });

    it('will populate the meta data store', function () {
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 1);
    });

    it('will leave the token store empty', function () {
      assert.equal(Object.keys(hum.idx.tokenStore.root).length, 0);
    });
  });

  describe('adding one or more documents having a name field', function () {
    beforeEach(function () {
      hum = new Hummingbird();
      hum.add(doc2);
      hum.add(doc3);
    });

    it('should create trigrams in the token store', function () {
      const tokens = Object.keys(hum.idx.tokenStore.root).sort();
      const firstToken = startOfStringIndicator.concat('st');
      assert.equal(tokens.length, 11);
      assert.deepEqual(tokens, [firstToken, 'ani', 'eph', 'eve', 'han', 'nie', 'pha', 'ste', 'tep', 'tev', 'ven']);
    });

    it("should have 2 documents containing 'ste'", function () {
      assert.equal(Object.keys(hum.idx.tokenStore.get('ste')).length, 2);
    });

    it('should have 2 docs in the metaStore', function () {
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 2);
    });

    it('will execute the supplied callback when matches are found', function (done) {
      const callback = (results) => {
        assert.equal(results[0].id, doc2.id);
        assert.equal(results[1].id, doc3.id);
        done();
      }
      hum.search('Steve', callback);
    });

    it('will resolve the promise with the matches that are found', function () {
      const promiseHandler = (results) => {
        assert.equal(results[0].id, doc3.id);
      }
      return hum.searchAsync('stefanie').then(promiseHandler)
    });
  });

  describe('adding a document that already exists', function () {
    beforeEach(function () {
      hum.add(doc2);
      hum.add(doc3);
    });

    it('should not change the token nor meta stores', function () {
      assert.equal(Object.keys(hum.idx.tokenStore.root).length, 11);
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 2);
      hum.add(doc2);
      assert.equal(Object.keys(hum.idx.tokenStore.root).length, 11);
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 2);
    });

    it("should still have 'ste' as a token in the store", function () {
      hum.add(doc2);
      assert.ok(hum.idx.tokenStore.get('ste', false));
    });

    it("should still have only two documents containing 'ste'", function () {
      hum.add(doc2);
      assert.equal(Object.keys(hum.idx.tokenStore.get('ste')).length, 2);
    });

    it('should still have only 2 docs in the metaStore', function () {
      hum.add(doc2);
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 2);
    });
  });

  describe('removing a document', function () {
    beforeEach(function () {
      hum.add(doc2);
      hum.add(doc3);
    });

    it('should not have the document in the index stores after it is removed', function () {
      assert.equal(Object.keys(hum.idx.tokenStore.get('ste')).length, 2);
      hum.remove(doc2.id);
      assert.notEqual(hum.idx.metaStore.has(doc2.id), true);
      assert.equal(hum.idx.metaStore.has(doc3.id), true);
      assert.equal(hum.idx.tokenStore.has('ste'), true);
      assert.equal(Object.keys(hum.idx.tokenStore.get('ste')).length, 1);
    });
  });

  describe('removing a non-existent document', function () {
    const doc = { id: 99, name: 'I dont exist' };

    beforeEach(function () {
      hum.add(doc2);
      hum.add(doc3);
    });

    it('should not have the non-existent document ID in the metaStore', function () {
      assert.equal(hum.idx.metaStore.has(99), false);
    });

    it('should have other documents in the index', function () {
      assert.equal(hum.idx.metaStore.has(2), true);
    });
  });

  describe('updating a document', function () {
    const doc02 = Object.assign({}, doc2, { name: 'foo' });
    const doc03 = Object.assign({}, doc3, { name: 'bar' });

    beforeEach(function () {
      hum.add(doc2);
      hum.add(doc3);
    });

    it('should have a couple of documents in the index before update', function () {
      assert.equal(hum.idx.tokenStore.has('ste'), true);
      assert.ok(hum.idx.metaStore.has(2));
      assert.notEqual(hum.idx.tokenStore.has('bar'), true);
    });

    it('should replace the name in the index after updating the same doc ID', function () {
      hum.update(doc02);
      hum.update(doc03);

      assert.equal(hum.idx.tokenStore.has('bar'), true);
      assert.notEqual(hum.idx.tokenStore.has('ste'), true);
    });

    it('should have the same number of documents in the index as before the update', function () {
      hum.update(doc02);
      hum.update(doc03);

      assert.equal(hum.idx.metaStore.has(2), true);
    });
  });
});
