module('search', {
  setup: function () {
    var idx = new hummingbird.Index
    idx.tokenizer = new hummingbird.tokenizer(3)

    ;([{
      id: 'a',
      name: 'Mr. Green killed Colonel Mustard in the study with the candlestick. Mr. Green is not a very nice fellow.',
      meta: {
        title: 'Mr. Green kills Colonel Mustard',
        wordCount: 19
      }
    },{
      id: 'b',
      name: 'Professor Plumb has a green plant in his study',
      meta: {
        title: 'Plumb waters plant',
        wordCount: 9
      }
    },{
      id: 'c',
      name: 'Miss Scarlett watered Professor Plumbs green plant while he was away from his office last week.',
      meta: {
        title: 'Scarlett helps Professor',
        wordCount: 16
      }
    },{
      id: 'd',
      name: 'handsome',
      meta: {
        title: 'title',
      }
    },{
      id: 'e',
      name: 'hand',
      meta: {
        title: 'title',
      }
    }]).forEach(function (doc) {  idx.add(doc) })

    this.idx = idx
  }
})

test('returning the correct results', function () {
  var results = this.idx.search('green plant')

  equal(results.length, 3)
  equal(results[0].id, 'b')
  equal(results[1].id, 'c')
  equal(results[2].id, 'a')
  equal(results[0].meta.title, 'Plumb waters plant')
  equal(results[0].meta.wordCount, '9')
  equal(results[1].meta.title, 'Scarlett helps Professor')
  equal(results[2].meta.title, 'Mr. Green kills Colonel Mustard')
})

test('no search tokens in the index', function () {
  var results = this.idx.search('zoo')

  equal(results.length, 0)
})

test('search results ranked by score', function () {
  var results = this.idx.search('professor')

  equal(results.length, 2)
  equal(results[0].id, 'b')
  equal(results[1].id, 'c')

  equal(results[0].score, 24)
  equal(results[1].score, 21)
})

test('search boosts exact matches', function () {
  var results = this.idx.search('hand')

  equal(results.length, 3)
  equal(results[0].id, 'e')
  equal(results[1].id, 'd')
  equal(results[2].id, 'a')

  ok(results[0].score > results[1].score)
  ok(results[1].score > results[2].score)
})

test('ngram search prefix matching', function () {
  var results = this.idx.search('plu')

  equal(results.length, 2)
  equal(results[0].id, 'b')
  equal(results[1].id, 'c')
})

test('ngram search suffix matching', function () {
  var results = this.idx.search('udy')

  equal(results.length, 2)
  equal(results[0].id, 'b')
  equal(results[1].id, 'a')

  ok(results[0].score > results[1].score)
})

test('ngram search query too short', function () {
  var results = this.idx.search('y')

  equal(results.length, 0)
})

test('ngram search mid string phrase with typo', function () {
  var results = this.idx.search('watered plant')

  equal(results[0].id, 'c')
})
