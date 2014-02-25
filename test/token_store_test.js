module('hummingbird.TokenStore')

test('adding a token to the store', function () {
  var store = new hummingbird.TokenStore,
      doc = '123',
      token = 'foo'

  store.add(token, doc)

  ok(store.root['foo'][0] === doc)
  equal(store.root['foo'].length, 1)
})

test('adding another document to the token', function () {
  var store = new hummingbird.TokenStore,
      doc1 = '123',
      doc2 = '456',
      token = 'foo'

  store.add(token, doc1)
  store.add(token, doc2)

  ok(store.root['foo'][0] === doc1)
  ok(store.root['foo'][1] === doc2)
})

test('checking if a token exists in the store', function () {
  var store = new hummingbird.TokenStore,
      doc = '123',
      token = 'foo'

  store.add(token, doc)

  ok(store.has(token))
})

test('checking if a token does not exist in the store', function () {
  var store = new hummingbird.TokenStore,
      doc = '123',
      token = 'foo'

  ok(!store.has('bar'))
  store.add(token, doc)
  ok(!store.has('bar'))
})

test('retrieving items from the store', function () {
  var store = new hummingbird.TokenStore,
      doc = '123',
      token = 'foo'

  store.add(token, doc)
  deepEqual(store.get(token), ['123'])
  deepEqual(store.get(''), [])
})

test('retrieving items that do not exist in the store', function () {
  var store = new hummingbird.TokenStore

  deepEqual(store.get('foo'), [])
})

test('counting items in the store', function () {
  var store = new hummingbird.TokenStore,
      doc1 = '123',
      doc2 = '456',
      doc3 = '789'

  store.add('foo', doc1)
  store.add('foo', doc2)
  store.add('bar', doc3)

  equal(store.count('foo'), 2)
  equal(store.count('bar'), 1)
  equal(store.count('baz'), 0)
})

test('removing a document from the token store', function () {
  var store = new hummingbird.TokenStore,
      doc = '123'

  deepEqual(store.get('foo'), [])
  store.add('foo', doc)
  deepEqual(store.get('foo'), ['123'])

  store.remove('foo', '123')
  deepEqual(store.get('foo'), [])
  equal(store.has('foo'), false)
})

test('removing a document that is not in the store', function () {
  var store = new hummingbird.TokenStore,
      doc1 = '123',
      doc2 = '567'

  store.add('foo', doc1)
  store.add('bar', doc2)
  store.remove('foo', '456')

  deepEqual(store.get('foo'), ['123'])
})

test('removing a document from a key that does not exist', function () {
  var store = new hummingbird.TokenStore

  store.remove('foo', 123)
  ok(!store.has('foo'))
})

test('serialization', function () {
  var store = new hummingbird.TokenStore

  //deepEqual(store.toJSON(), { root: { docs: {} }, length: 0 })
  deepEqual(store.toJSON(), { root: {} })

  store.add('foo', '123')

  deepEqual(store.toJSON(),
    {
      root: {
        foo: ['123']
      }
    }
  )
})

test('loading a serialized story', function () {
  var serializedData = {
    root: {
      foo: [123]
    }
  }

  var store = hummingbird.TokenStore.load(serializedData),
      documents = store.get('foo')

  //equal(store.length, 1)
  deepEqual(documents, [123])
})
