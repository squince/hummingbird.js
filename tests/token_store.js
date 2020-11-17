const hum = require("../../hummingbird.js");
const assert = require("assert").strict;

describe("Hummingbird Token Store", function () {
  let store;
  const startOfStringIndicator = "\u0002";
  const doc1 = {id: 123, token: "foo"};
  const doc2 = {id: 456, token: "foo"};

  before(function () {
    store = new hum.TokenStore;
  });

  describe('adding a token to the store', function () {
    before(function () {
      store.add(doc1.token, false, doc1.id);
    });

    it('should result in the token store containing the token', function () {
      assert.ok(store.has(doc1.token));
    });

    it('should associate the token with the doc ID', function () {
      assert.equal(store.root[doc1.token].n[doc1.id], 1);
    });

    it('should associate the token with only one doc ID', function () {
      assert.equal(Object.keys(store.root['foo'].n).length, 1);
    });
  });

  describe('adding 2 documents to the token in the store', function () {
    before(function () {
      store.add(doc1.token, false, doc1.id);
      store.add(doc2.token, false, doc2.id);
    });

    it('should result in the token store containing the token', function () {
      assert.ok(store.has(doc1.token));
      assert.ok(store.has(doc2.token));
    });

    it('should associate the token with 2 doc IDs', function () {
      assert.equal(Object.keys(store.root[doc1.token].n).length, 2);
      assert.ok(store.root[doc1.token].n.hasOwnProperty(doc1.id.toString()));
      assert.ok(store.root[doc2.token].n.hasOwnProperty(doc2.id.toString()));
    });
  });

  /*
  describe('checking if a token does not exist in the store', function () {
    var store = new hummingbird.TokenStore,
        doc = '123',
        token = 'foo'

    assert.ok(!store.has('bar'))
    store.add(token, doc)
    assert.ok(!store.has('bar'))
  })

  describe('retrieving items from the store', function () {
    var store = new hummingbird.TokenStore,
        doc = '123',
        token = 'foo'

    store.add(token, false, doc)
    assert.deepEqual(store.get(token), {'123':1})
    assert.deepEqual(store.get(''),{})
  })

  describe('retrieving items that do not exist in the store', function () {
    var store = new hummingbird.TokenStore

    assert.deepEqual(store.get('foo'), {})
  })

  describe('counting items in the store', function () {
    var store = new hummingbird.TokenStore,
        doc1 = '123',
        doc2 = '456',
        doc3 = '789'

    store.add('foo', false, doc1)
    store.add('foo', true, doc2)
    store.add('bar', false, doc3)

    assert.equal(store.count('foo'), 2)
    assert.equal(store.count('bar'), 1)
    assert.equal(store.count('baz'), 0)
  })

  describe('removing a document from the token store', function () {
    var store = new hummingbird.TokenStore,
        doc = '123'

    assert.deepEqual(store.get('foo'), {})
    store.add('foo', false, doc)
    assert.deepEqual(store.get('foo'), {'123':1})

    store.remove(doc)
    assert.deepEqual(store.get('foo'), {})
    assert.equal(store.has('foo'), false)
  })

  describe('removing a document that is not in the store', function () {
    var store = new hummingbird.TokenStore,
        doc1 = '123',
        doc2 = '567'

    store.add('foo', false, doc1)
    store.add('bar', true, doc2)
    store.remove('456')

    assert.deepEqual(store.get('foo'), {'123':1})
  })

  describe('removing a document from a key that does not exist', function () {
    var store = new hummingbird.TokenStore

    store.remove('123')
    assert.ok(!store.has('foo'))
  })

  describe('serialization', function () {
    var store = new hummingbird.TokenStore

    //deepEqual(store.toJSON(), { root: { docs: {} }, length: 0 })
    assert.deepEqual(store.toJSON(), { root: {} })

    store.add('foo', false, '123')

    assert.deepEqual(store.toJSON(),
      {
        root: {
          foo: {
            n: {
              '123': 1
            }
          }
        }
      }
    )
  })

  describe('loading a serialized store', function () {
    var serializedData = {
      root: {
        foo: {
          n: {
            '123': 1
          }
        }
      }
    }

    var store = hummingbird.TokenStore.load(serializedData),
        documents = store.get('foo')

    //equal(store.length, 1)
    assert.deepEqual(documents, {123:1})
  });
  */
});

