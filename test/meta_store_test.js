module('hummingbird.MetaStore')

test('adding meta to the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{} 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])
})

test('removing meta from the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{} 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])

  var docId = '123'
  store.remove(docId)

  ok(store.root['123'] === undefined)

})

test('retrieving meta from the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{} 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])

  var docId = '123'
  var obj = store.get(docId)

  ok(typeof obj === 'object')

})

