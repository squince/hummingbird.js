module('search non-latin', {
  setup: function () {
    var idx = new hummingbird.Index()
    idx.tokenizer = new hummingbird.tokenizer(1,2)

    ;([{
      id: 'g',
      name: '韩韬',
      title: 'Senior Engineer, Carrier Support',
      company: "Tokyo Women's Medical University Graduate School of Medicine"
    },{
      id: 'h',
      name: '陈啸',
      title: 'Lab Director',
      company: 'Sichuan AmaNing Biotechnology Co., Ltd.'
    },{
      id: 'i',
      name: '陈康',
      title: 'Chief Physician',
      company: 'Fudan-Cinpathogen Center'
    }]).forEach(function (doc) {  idx.add(doc) })

    this.idx = idx
  }
})

test('return correct results - single token prefix', function () {
  this.idx.search('陈', function(results) {
    equal(results.length, 2)
    equal(results[0].id, 'h')
    equal(results[1].id, 'i')
    equal(results[0].title, 'Lab Director')
    equal(results[1].company, 'Fudan-Cinpathogen Center')
    equal(results[0].score, results[1].score)
  });
})

test('return correct results - sort desc', function () {
  var options = {"secondarySortOrder":"desc"};
  this.idx.search('陈', function(results) {
    equal(results.length, 2)
    equal(results[0].id, 'i')
    equal(results[1].id, 'h')
    equal(results[0].company, 'Fudan-Cinpathogen Center')
    equal(results[1].title, 'Lab Director')
    equal(results[0].score, results[1].score)
  }, options);
})

test('return correct results - single token suffix', function () {
  this.idx.search('康', function(results) {
    equal(results.length, 1)
    equal(results[0].id, 'i')
    equal(results[0].title, 'Chief Physician')
  });
})

test('return correct results - 2 tokens', function () {
  this.idx.search('陈啸', function(results) {
    equal(results.length, 1)
    equal(results[0].id, 'h')
    equal(results[0].score, 7.5)
    equal(results[0].title, 'Lab Director')
  }, {'scoreThreshold':0.75});
})

test('return no results - non matching query', function () {
  this.idx.search('green plant', function(results) {
    equal(results.length, 0)
  });
})
