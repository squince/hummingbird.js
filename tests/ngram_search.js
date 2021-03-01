import Indexer from "../src/indexer.mjs";
import Tokenizer from "../src/tokenizer.mjs";
import assert from "assert";

describe("Hummingbird NGram Search", function () {
  let idx;
  const variants = {'scarlett': ['scar', 'scary', 'rouge']}
  const startOfStringIndicator = "\u0002";

  const doc1 = {id: 'a', name: 'Mr. Green killed Colonel Mustard in the study with the candlestick. Mr. Green is not a very nice fellow.', title: 'Mr. Green kills Colonel Mustard', wordCount: 19, company: 'Askew Software, Inc'};
  const doc2 = {id: 'b', name: 'Professor Plumb has a green plant in his study', title: 'Plumb waters plant', wordCount: 9};
  const doc3 = {id: 'c', name: 'Miss Scary watered Professor Plumbs green plant while he was away from his office last week.', title: 'Scary helps Professor', wordCount: 16};
  const doc4 = {id: 'd', name: 'handsome', title: 'title', company: 'Foobar, LLC'};
  const doc5 = {id: 'e', name: 'hand', title: 'title', company: 'foobar, corp'};
  const doc6 = {id: 'f', name: 'Scarlett Johnson', title: 'Mi Bambina', company: 'My Test Corp'};

  beforeEach(function () {
    const loggingOn = false;
    const tokenizer = new Tokenizer({min: 3});
    idx = new Indexer(variants, tokenizer, loggingOn);
    [doc1, doc2, doc3, doc4, doc5, doc6].forEach( doc => idx.add({doc}));
  });

  describe('searching for a combination of substrings from multiple document titles', function () {
    it('should return the one document that scores above the threshold', function () {
      idx.search('scarlett watered a green plant', function (results) {
        assert.equal(results.length, 1);
        assert.equal(results[0].id, doc3.id);
        assert.equal(results[0].title, doc3.title);
      });
    });
  });

  describe('searching for a string containing a variant', function () {
    it('should return the one document that contains the variant match', function () {
      // TODO: hmmm, we should make indexed documents immutable
      // console.log('#### doc6 BEFORE ####', doc6);
      idx.search('Rouge ', function(results) {
        // console.log('#### results[0] ####', results[0]);
        // console.log('#### doc6 AFTER ####', doc6);
        assert.deepStrictEqual(results[0], doc6);
        assert.equal(results[0].score, 10.6);
      }, {'scoreThreshold':0});
    });
  });

  describe('searching for 2 words appearing in 3 documents using default settings', function () {
    it('should return 2 documents', function () {
      idx.search('green plant', function(results) {
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc3, doc2]);
      });
    });
  });

  describe('searching for 2 words appearing in 3 documents using no prefix boost & no threshold', function () {
    it('should return all 3 documents', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('green plant', function(results) {
        assert.equal(results.length, 3);
        assert.deepEqual(results, [doc3, doc2, doc1]);
      }, options);
    });
  });

  describe('searching for 2 words appearing in 3 documents using no prefix boost & no threshold & limiting howMany are returned', function () {
    it('should return the top 2 matching documents', function () {
      const options = {"howMany":2, "boostPrefix":false, "scoreThreshold":0};
      idx.search('green plant', function(results) {
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc3, doc2]);
      }, options);
    });
  });

  describe('searching for a word using a prefix boost, but no threshold', function () {
    it('should return the 3 matching documents in descending order by score', function () {
      const options = {"boostPrefix":true, "scoreThreshold":0};
      idx.search('hand', function(results) {
        assert.equal(results.length, 3);
        assert.deepEqual(results, [doc5, doc4, doc1]);
        assert.equal(results[0].score, 9.3);
        assert.equal(results[1].score, 9.2);
        assert.equal(results[2].score, 3);
      }, options);
    });
  });

  describe('searching for a word using a prefix boost and a non-zero threshold', function () {
    it('should return only 2 of the matching documents in descending order by score', function () {
      const options = {"boostPrefix":true, "scoreThreshold":.75};
      idx.search('hand', function(results) {
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc5, doc4]);
        assert.equal(results[0].score, 9.3);
        assert.equal(results[1].score, 9.2);
      }, options);
    });
  });

  describe('searching for 2 words appearing in 3 documents using custom secondary sort ascending', function () {
    it('should return the 3 matching documents where the 2 with equal scores appearing in ascending order by title', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"title", "secondarySortOrder":"asc"};
      idx.search('green plant', function(results) {
        assert.equal(results.length, 3);
        assert.deepEqual(results, [doc2, doc3, doc1]);
        assert.equal(results[0].score, 27);
        assert.equal(results[1].score, 27);
        assert.equal(results[2].score, 12);
        assert.equal(results[0].title, 'Plumb waters plant');
        assert.equal(results[1].title, 'Scary helps Professor');
        assert.equal(results[2].title, 'Mr. Green kills Colonel Mustard');
      }, options);
    });
  });

  describe('searching for 2 words appearing in 3 documents using custom secondary sort descending', function () {
    it('should return the 3 matching documents where the 2 with equal scores appearing in descending order by title', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"title", "secondarySortOrder":"desc"};
      idx.search('green plant', function(results) {
        assert.equal(results.length, 3);
        assert.deepEqual(results, [doc3, doc2, doc1]);
        assert.equal(results[0].score, 27);
        assert.equal(results[1].score, 27);
        assert.equal(results[2].score, 12);
        assert.equal(results[0].title, 'Scary helps Professor');
        assert.equal(results[1].title, 'Plumb waters plant');
        assert.equal(results[2].title, 'Mr. Green kills Colonel Mustard');
      }, options);
    });
  });

  describe('searching for a term not in any of the documents', function () {
    it('should return no documents', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('zoo', function (results) {
        assert.equal(results.length, 0);
      }, options);
    });
  });

  describe('searching for a term', function () {
    it('should boost scores for docs with exact matches', function () {
      const options = {"howMany":3, "boostPrefix":false, "scoreThreshold":0};
      idx.search('hand', function(results){
        assert.equal(results.length, 3);
        assert.deepEqual(results, [doc5, doc4, doc1]);
        assert.ok(results[0].score > results[1].score);
        assert.ok(results[1].score > results[2].score);
        assert.equal(results[0].score, 9.1);
        assert.equal(results[1].score, 9);
        assert.equal(results[2].score, 3);
      }, options);
    });
  });

  describe('searching for prefix match', function () {
    it('should return documents that have a partial match', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('plu', function(results){
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc3, doc2]);
      }, options);
    });
  });

  describe('searching for suffix match', function () {
    it('should return documents that have a partial match', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('udy', function(results){
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc1, doc2]);
        assert.equal(results[0].score, results[1].score);
      }, options);
    });
  });

  describe('searching for a query that is shorter than the default ngram size', function () {
    it('should return no results', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('ay', function(results){
        assert.equal(results.length, 0);
      }, options);
    });
  });

  describe('searching for a string that only appears in the middle of phrases', function () {
    it('should return the docs that contain the string provided their score exceeds the threshold', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('ater', function(results){
        assert.deepEqual(results, [doc3]);
      }, options);
    });
  });

  describe('searching for a string that contains a typo', function () {
    it('should still return the intended documents', function () {
      const options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
      idx.search('watered plant', function(results){
        assert.deepEqual(results, [doc3, doc2, doc1]);
        assert.equal(results[0].score, 33);
        assert.equal(results[1].score, 12);
        assert.equal(results[2].score, 3);
      }, options);
    });
  });
});
