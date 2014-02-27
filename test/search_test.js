module('search', {
  setup: function () {
    var idx = new hummingbird.Index
    idx.tokenizer = new hummingbird.tokenizer(3)

    ;([{
      id: 'a',
      name: 'Mr. Green killed Colonel Mustard in the study with the candlestick. Mr. Green is not a very nice fellow.',
      title: 'Mr. Green kills Colonel Mustard',
      wordCount: 19
    },{
      id: 'b',
      name: 'Professor Plumb has a green plant in his study',
      title: 'Plumb waters plant',
      wordCount: 9
    },{
      id: 'c',
      name: 'Miss Scarlett watered Professor Plumbs green plant while he was away from his office last week.',
      title: 'Scarlett helps Professor',
      wordCount: 16
    },{
      id: 'd',
      name: 'handsome',
      title: 'title'
    },{
      id: 'e',
      name: 'hand',
      title: 'title',
      company: 'foo bar llc'
    }]).forEach(function (doc) {  idx.add(doc) })

    this.idx = idx
  }
})

test('returning the correct results', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('green plant', function(results) {
    equal(results.length, 3)
    equal(results[0].id, 'b')
    equal(results[1].id, 'c')
    equal(results[2].id, 'a')
    equal(results[0].title, 'Plumb waters plant')
    equal(results[0].wordCount, '9')
    equal(results[1].title, 'Scarlett helps Professor')
    equal(results[2].title, 'Mr. Green kills Colonel Mustard')
  }, options);
})

test('no search tokens in the index', 0, function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('zoo', function (results) {
    // no results returned, so nothing to do
  }, options);
})

test('search results ranked by score', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('professor', function(results){

    equal(results.length, 2)
    equal(results[0].id, 'b')
    equal(results[1].id, 'c')

    equal(results[0].score, 24)
    equal(results[1].score, 21)
  }, options);
})

test('search boosts exact matches', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('hand', function(results){

    equal(results.length, 3)
    equal(results[0].id, 'e')
    equal(results[1].id, 'd')
    equal(results[2].id, 'a')

    ok(results[0].score > results[1].score)
    ok(results[1].score > results[2].score)
  }, options);
})

test('ngram search prefix matching', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('plu', function(results){

    equal(results.length, 2)
    equal(results[0].id, 'b')
    equal(results[1].id, 'c')
  }, options);
})

test('ngram search suffix matching', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('udy', function(results){

    equal(results.length, 2)
    equal(results[0].id, 'b')
    equal(results[1].id, 'a')

    ok(results[0].score > results[1].score)
  }, options);
})

test('ngram search query too short', 0, function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('y', function(results){
    // no results returned, so nothing to do
  }, options);
})

test('ngram search mid string phrase with typo', function () {
  var options = {"howMany":10, "boostPrefix":false, "scoreThreshold":0};
  this.idx.search('watered plant', function(results){

    equal(results[0].id, 'c')
  }, options);
})
