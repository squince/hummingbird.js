const hum = require("../../hummingbird.js");
const assert = require("assert").strict;

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
    idx = new hum.Index(variants);
    idx.tokenizer = new hum.tokenizer(3);
    [doc1, doc2, doc3, doc4, doc5, doc6].forEach( doc => idx.add(doc));
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

  describe('searching for a string containing a variat', function () {
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

  describe('searching for a string appearing in 2 documents with default settings', function () {
    it('should return the 2 documents', function () {
      idx.search('green plant', function(results) {
        assert.equal(results.length, 2);
        assert.deepEqual(results, [doc3, doc2]);
      });
    });
  });

  /*
  describe('return correct results - no boost, no threshold', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('green plant', function(results) {
      equal(results.length, 3)
      equal(results[0].id, 'c')
      equal(results[1].id, 'b')
      equal(results[2].id, 'a')
      equal(results[0].title, 'Scary helps Professor')
      equal(results[1].title, 'Plumb waters plant')
      equal(results[2].title, 'Mr. Green kills Colonel Mustard')
    }, options);
  });

  describe('return correct results - howMany, no boost, no threshold', function () {
    var options = {"howMany":2, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('green plant', function(results) {
      equal(results.length, 2)
      equal(results[0].id, 'c')
      equal(results[1].id, 'b')
    }, options);
  });

  describe('return correct results - with boost, no threshold', function () {
    var options = {"boostPrefix":true, "scoreThreshold":0};
    this.idx.search('hand', function(results) {
      equal(results.length, 3)
      equal(results[0].id, 'e')
      equal(results[1].id, 'd')
      equal(results[2].id, 'a')
      equal(results[0].score, '9.3')
      equal(results[1].score, '9.2')
      equal(results[2].score, '3')
    }, options);
  });

  describe('return the correct results - with boost, with threshold', function () {
    options = {"boostPrefix":true, "scoreThreshold":.75};
    this.idx.search('hand', function(results) {
      equal(results.length, 2)
      equal(results[0].id, 'e')
      equal(results[1].id, 'd')
      equal(results[0].score, '9.3')
      equal(results[1].score, '9.2')
    }, options);
  });

  describe('return correct results - custom secondary sort ascending', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"title", "secondarySortOrder":"asc"};
    this.idx.search('green plant', function(results) {
      equal(results.length, 3)
      equal(results[0].score, '27')
      equal(results[1].score, '27')
      equal(results[2].score, '12')
      equal(results[0].id, 'b')
      equal(results[1].id, 'c')
      equal(results[2].id, 'a')
      equal(results[0].title, 'Plumb waters plant')
      equal(results[1].title, 'Scary helps Professor')
      equal(results[2].title, 'Mr. Green kills Colonel Mustard')
    }, options);
  });

  describe('return correct results - custom secondary sort descending', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"title", "secondarySortOrder":"desc"};
    this.idx.search('green plant', function(results) {
      equal(results.length, 3)
      equal(results[0].score, '27')
      equal(results[1].score, '27')
      equal(results[2].score, '12')
      equal(results[0].id, 'c')
      equal(results[1].id, 'b')
      equal(results[2].id, 'a')
      equal(results[0].title, 'Scary helps Professor')
      equal(results[1].title, 'Plumb waters plant')
      equal(results[2].title, 'Mr. Green kills Colonel Mustard')
    }, options);
  });

  describe('return correct results - custom sort asc', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"company", "secondarySortOrder":"asc"};
    this.idx.search('and', function(results) {
      equal(results.length, 3)
      equal(results[0].score, 3)
      equal(results[1].score, 3)
      equal(results[2].score, 3)
      equal(results[0].id, 'a')
      equal(results[1].id, 'e')
      equal(results[2].id, 'd')
      equal(results[0].company, 'Askew Software, Inc')
      equal(results[1].company, 'foobar, corp')
      equal(results[2].company, 'Foobar, LLC')
    }, options);
  });

  describe('return correct results - custom sort desc', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0, "secondarySortField":"company", "secondarySortOrder":"desc"};
    this.idx.search('and', function(results) {
      equal(results.length, 3)
      equal(results[0].score, 3)
      equal(results[1].score, 3)
      equal(results[2].score, 3)
      equal(results[0].id, 'd')
      equal(results[1].id, 'e')
      equal(results[2].id, 'a')
      equal(results[0].company, 'Foobar, LLC')
      equal(results[1].company, 'foobar, corp')
      equal(results[2].company, 'Askew Software, Inc')
    }, options);
  });

  describe('no search tokens in the index', 0, function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('zoo', function (results) {
      // no results returned, so nothing to do
    }, options);
  });

  describe('search results ranked by score - default options', function () {
    this.idx.search('professor', function(results){
      equal(results.length, 2)
      equal(results[0].id, 'b')
      equal(results[1].id, 'c')
      equal(results[0].score, 24.2)
      equal(results[1].score, 21)
    });
  });

  describe('search results ranked by score - modified options', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('professor', function(results){

      equal(results.length, 2)
      equal(results[0].id, 'b')
      equal(results[1].id, 'c')

      equal(results[0].score, 24)
      equal(results[1].score, 21)
    }, options);
  });

  describe('search boosts exact matches', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('hand', function(results){

      equal(results.length, 3)
      equal(results[0].id, 'e')
      equal(results[1].id, 'd')
      equal(results[2].id, 'a')

      ok(results[0].score = results[1].score)
      ok(results[1].score > results[2].score)
    }, options);
  });

  describe('search boosts full string matches', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('hand', function(results) {
      equal(results.length, 3)
      equal(results[0].id, 'e')
      equal(results[1].id, 'd')
      equal(results[2].id, 'a')
      equal(results[0].score, '9.1')
      equal(results[1].score, '9')
      equal(results[2].score, '3')
    }, options);
  });

  describe('ngram search prefix matching', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('plu', function(results){

      equal(results.length, 2)
      equal(results[0].id, 'c')
      equal(results[1].id, 'b')
    }, options);
  });

  describe('ngram search suffix matching', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('udy', function(results){

      equal(results.length, 2)
      equal(results[0].id, 'a')
      equal(results[1].id, 'b')

      ok(results[0].score = results[1].score)
    }, options);
  });

  describe('ngram search query too short', 0, function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('y', function(results){
      // no results returned, so nothing to do
    }, options);
  });

  describe('ngram search mid string phrase with typo', function () {
    var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
    this.idx.search('watered plant', function(results){

      equal(results[0].id, 'c')
    }, options);
  });
  */
});
