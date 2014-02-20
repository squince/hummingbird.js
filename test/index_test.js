module('hummingbird.Index')

test('adding a document with an empty field', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'test', title: ''}

  idx.add(doc)
  equal(idx.tokenStore.get('tes')[0], 1)
})

test('triggering add events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'this is a test'},
      callbackCalled = false,
      callbackArgs = []

  idx.on('add', function (doc, index) {
    callbackCalled = true
    callbackArgs = Array.prototype.slice.call(arguments)
  })

  idx.add(doc)

  ok(callbackCalled)
  equal(callbackArgs.length, 2)
  deepEqual(callbackArgs[0], doc)
  deepEqual(callbackArgs[1], idx)
})

test('silencing add events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'this is a test'},
      callbackCalled = false,
      callbackArgs = []

  idx.on('add', function (doc, index) {
    callbackCalled = true
    callbackArgs = Array.prototype.slice.call(arguments)
  })

  idx.add(doc, false)

  ok(!callbackCalled)
})

/*
test('removing a document from the index', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, body: 'this is a test'}

  idx.field('body')
  equal(idx.documentStore.getlength(), 0)

  idx.add(doc)
  equal(idx.documentStore.getlength(), 1)

  idx.remove(doc)
  equal(idx.documentStore.getlength(), 0)
})
*/
test('triggering remove events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'this is a test'},
      callbackCalled = false,
      callbackArgs = []

  idx.on('remove', function (doc, index) {
    callbackCalled = true
    callbackArgs = Array.prototype.slice.call(arguments)
  })

  idx.add(doc)
  idx.remove(doc)

  ok(callbackCalled)
  equal(callbackArgs.length, 2)
  deepEqual(callbackArgs[0], doc)
  deepEqual(callbackArgs[1], idx)
})

test('silencing remove events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'this is a test'},
      callbackCalled = false,
      callbackArgs = []

  idx.on('remove', function (doc, index) {
    callbackCalled = true
    callbackArgs = Array.prototype.slice.call(arguments)
  })

  idx.add(doc)
  idx.remove(doc, false)

  ok(!callbackCalled)
})

/*
test('removing a non-existent document from the index', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, body: 'this is a test'},
      doc2 = {id: 2, body: 'i dont exist'},
      callbackCalled = false

  idx.on('remove', function (doc, index) {
    callbackCalled = true
  })

  idx.field('body')
  equal(idx.documentStore.getlength(), 0)

  idx.add(doc)
  equal(idx.documentStore.getlength(), 1)

  idx.remove(doc2)
  equal(idx.documentStore.getlength(), 1)

  ok(!callbackCalled)
})
*/
test('updating a document', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'foo'}

  idx.add(doc)
  ok(idx.tokenStore.has('foo'))

  doc.name = 'bar'
  idx.update(doc)

  ok(idx.tokenStore.has('bar'))
})

test('emitting update events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'foo'}
      addCallbackCalled = false,
      removeCallbackCalled = false,
      updateCallbackCalled = false,
      callbackArgs = []

  idx.add(doc)
  ok(idx.tokenStore.has('foo'))

  idx.on('update', function (doc, index) {
    updateCallbackCalled = true
    callbackArgs = Array.prototype.slice.call(arguments)
  })

  idx.on('add', function () {
    addCallbackCalled = true
  })

  idx.on('remove', function () {
    removeCallbackCalled = true
  })


  doc.name = 'bar'
  idx.update(doc)

  ok(updateCallbackCalled)
  equal(callbackArgs.length, 2)
  deepEqual(callbackArgs[0], doc)
  deepEqual(callbackArgs[1], idx)

  ok(!addCallbackCalled)
  ok(!removeCallbackCalled)
})

test('silencing update events', function () {
  var idx = new hummingbird.Index,
      doc = {id: 1, name: 'foo'}
      callbackCalled = false

  idx.add(doc)
  ok(idx.tokenStore.has('foo'))

  idx.on('update', function (doc, index) {
    callbackCalled = true
  })

  doc.name = 'bar'
  idx.update(doc, false)

  ok(!callbackCalled)
})
