import Hummingbird from '../src/hummingbird.mjs';
import assert from 'assert';

describe('Index Serialization', function () {
  const doc1 = {
    id: 'a',
    title: 'Mr. Green kills Colonel Mustard',
    name: 'Mr. Green killed Colonel Mustard in the study with the candlestick. Mr. Green is not a very nice fellow.'
  };
  const doc2 = {
    id: 'b',
    title: 'Plumb waters plant',
    name: 'Professor Plumb has a green plant in his study'
  };
  const doc3 = {
    id: 'c',
    title: 'Scarlett helps Professor',
    name: 'Miss Scarlett watered Professor Plumbs green plant while he was away from his office last week.'
  };
  const documentSet = [doc1, doc2, doc3];

  describe('serializing an index', function () {
    const hum = new Hummingbird(null, {min: 3, max: 6});
    const hum_clone = new Hummingbird();
    documentSet.forEach((doc) => hum.add(doc));

    beforeEach(function () {
      const dumped_hum = JSON.stringify(hum.serialize());
      hum_clone.load(JSON.parse(dumped_hum));
    });

    it('should produce an idential index upon reloading', function () {
      assert.deepEqual(hum.idx.tokenStore, hum_clone.idx.tokenStore);
    });

    it('should produce idential search results after reloading', function () {
      const results1 = hum.search('green plant', function (results) {
        return results;
      });
      const results2 = hum_clone.search('green plant', function (results) {
        return results;
      });

      assert.deepEqual(results1, results2);
    });
  });
});
