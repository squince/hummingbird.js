import hum from "../src/hummingbird.js";
import assert from "assert";

describe("Non Latin Characters", function () {
  let idx;
  const doc1 = {
    id: 'g',
    name: '韩韬',
    title: 'Senior Engineer, Carrier Support',
    company: "Tokyo Women's Medical University Graduate School of Medicine"
  };
  const doc2 = {
    id: 'h',
    name: '陈啸',
    title: 'Lab Director',
    company: 'Sichuan AmaNing Biotechnology Co., Ltd.'
  };
  const doc3 = {
    id: 'i',
    name: '陈康',
    title: 'Chief Physician',
    company: 'Fudan-Cinpathogen Center'
  };

  before(function () {
    idx = new hum.Index;
    idx.tokenizer = new hum.tokenizer(1,2);
    [doc1, doc2, doc3].forEach( function (doc) {idx.add(doc)} );
  });

  describe('searching for a single token prefix should return 2 results', function () {
    let searchResults;
    before(function () {
      idx.search('陈', function(results) {
        searchResults = results;
      });
    });

    it("should return 2 results", function () {
      assert.equal(searchResults.length, 2);
    });
    it("should return docs with the same document score", function () {
      assert.equal(searchResults[0].score, searchResults[1].score);
    });
    it("should return results in document order", function () {
      assert.equal(searchResults[0].id, doc2.id);
      assert.equal(searchResults[1].id, doc3.id);
    });
  });

  describe('searching while specifying sort order descending', function () {
    let searchResults;
    const options = {"secondarySortOrder":"desc"};
    before(function () {
      idx.search('陈', function(results) {
        searchResults = results;
      }, options);
    });

    it("should return results in opposite order", function () {
      assert.equal(searchResults[0].id, doc3.id);
      assert.equal(searchResults[1].id, doc2.id);
    });
  });

  describe('searching for a single token suffix', function () {
    let searchResults;

    before(function () {
      idx.search('康', function(results) {
        searchResults = results;
      });
    });

    it("should return a single result", function () {
      assert.equal(searchResults.length, 1);
      assert.equal(searchResults[0].id, doc3.id);
    });
  });

  describe('searching for 2 Chinese characters with a score threshold', function () {
    let searchResults;
    const scoreThreshold = 0.75;

    before(function () {
      idx.search('陈啸', function(results) {
        searchResults = results;
      }, { scoreThreshold });
    });

    it("should return a single result", function () {
      assert.equal(searchResults.length, 1);
      assert.equal(searchResults[0].id, doc2.id);
    });

    it("with a document score greater than the threshold", function () {
      assert.ok(searchResults[0].score > scoreThreshold);
    });
  });

  describe('searching for a string not in the index', function () {
    let searchResults;

    before(function () {
      idx.search('green plant', function(results) {
        searchResults = results;
      });
    });

    it("should return an empty result set", function () {
      assert.equal(searchResults.length, 0);
    });
  });
});
