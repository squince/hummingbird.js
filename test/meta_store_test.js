module('hummingbird.MetaStore')

test('adding empty meta object to the store', function () {
  var store = new hummingbird.MetaStore

  var doc = {
    id:'123',
    name: 'test',
    meta:{}
  }
  store.add(doc)

  ok(store.root['123'] === doc)
})

test('adding meta object to the store', function () {
  var store = new hummingbird.MetaStore

  var doc = {
    id:'123',
    name: 'test',
    meta:{
      fname:'fred',
      lname:'smith',
      title: 'boss of the world'
    }
  }
  store.add(doc)

  ok(store.root['123'] === doc)

  var objMetaObj = store.root['123'].meta
  equal(objMetaObj['fname'], 'fred')
  equal(objMetaObj['lname'], 'smith')
  equal(objMetaObj['title'], 'boss of the world')
})


test('removing meta from the store', function () {
  var store = new hummingbird.MetaStore

  var doc = {
    id:'123',
    name: 'test',
    meta:{}
  }
  store.add(doc)

  ok(store.root['123'] === doc)

  var docId = '123'
  store.remove(docId)

  ok(store.root['123'] === undefined)

})

test('retrieving empty meta from the store', function () {
  var store = new hummingbird.MetaStore

  var doc = {
    id:'123',
    name: 'test',
    meta:{}
  }
  store.add(doc)

  ok(store.root['123'] === doc)

  var docId = '123'
  var meta = store.get(docId)

  ok(typeof meta === 'object')

})

test('retrieving meta object to the store', function () {
  var store = new hummingbird.MetaStore

  var doc = {
    id:'123',
    name: 'test',
    meta:{
      fname:'fred',
      lname:'smith',
      title: 'boss of the world'
    }
  }
  store.add(doc)

  ok(store.root['123'] === doc)

  var docId = '123'
  var objMetaObj = store.get(docId).meta
  equal(objMetaObj['fname'], 'fred')
  equal(objMetaObj['lname'], 'smith')
  equal(objMetaObj['title'], 'boss of the world')
})
