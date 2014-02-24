module('hummingbird.MetaStore')

test('adding empty meta object to the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{} 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])
})

test('adding meta object to the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{
      fname:'fred',
      lname:'smith',
      title: 'boss of the world'
    } 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])
  
  var myObj = store.root['123']
  equal(myObj['fname'], 'fred')
  equal(myObj['lname'], 'smith')
  equal(myObj['title'], 'boss of the world')
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

test('retrieving empty meta from the store', function () {
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

test('retrieving meta object to the store', function () {
  var store = new hummingbird.MetaStore
  
  var doc = {
    id:'123',
    obj:{
      fname:'fred',
      lname:'smith',
      title: 'boss of the world'
    } 
  }
  store.add(doc)

  ok(store.root['123'] === doc['obj'])
  
  var docId = '123'
  var myObj = store.get(docId)
  equal(myObj['fname'], 'fred')
  equal(myObj['lname'], 'smith')
  equal(myObj['title'], 'boss of the world')
})


