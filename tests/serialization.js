import Tokenizer from '../src/tokenizer.mjs';
// TODO: do not import the tokenizer separate from the indexer
import Index from '../src/indexer.mjs';
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
    let dumpedIndx, clonedIdx;

    const idx = new Index();
    idx.tokenizer = new Tokenizer({min: 3, max: 6});
    documentSet.forEach((doc) => idx.add(doc));

    beforeEach(function () {
      dumpedIdx = JSON.stringify(idx);
      clonedIdx = hum.Index.load(JSON.parse(dumpedIdx));
    });

    it('should produce an idential index upon reloading', function () {
      assert.deepEqual(idx.tokenStore, clonedIdx.tokenStore);
    });

    it('should produce idential search results after reloading', function () {
      clonedIdx.tokenizer = new Tokenizer({min: 3, max: 6});
      const results1 = idx.search('green plant', function (results) {
        return results;
      });
      const results2 = clonedIdx.search('green plant', function (results) {
        return results;
      });

      assert.deepEqual(results1, results2);
    });
  });
});
