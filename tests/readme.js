import Hummingbird from '../src/hummingbird.mjs';
import assert from 'assert';

describe('README Examples', function () {
  let hum, variantsObj;
  const loggingOn = true;

  describe('searching using a callback', function () {
    beforeEach(function () {
      hum = new Hummingbird();
      hum.add({id: 1, name: 'Benjamin Franklin', female: false});
      hum.add({id: 2, name: 'Richard Feynman', male: true});
    });

    it('will first populate the meta data store', function () {
      assert.equal(Object.keys(hum.idx.metaStore.root).length, 2);
      assert.equal(hum.idx.metaStore.root[1].id, 1);
      assert.equal(hum.idx.metaStore.root[2].id, 2);
    });

    it('and populate the token store', function () {
      assert.equal(Object.keys(hum.idx.tokenStore.root).length, 30);
    });

    it('then will return the doc that matches the search phrase', function () {
      hum.search('Dick Feynman', function (results) {
        for (const doc of results) {
          assert.equal(doc.id, '2');
          assert.equal(doc.name, 'Richard Feynman');
          assert.equal(doc.male, true);
        };
      });
    });
  });
});
