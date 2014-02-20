# TokenStore
The inverted index each token in the TokenStore maps to all the names
that contain that token

## constructor

    hummingbird.TokenStore = ->
      @root = {}
      return


## load
Loads a previously serialised token store

* param {Object} serialisedData The serialised token store to load.
* returns {hummingbird.TokenStore}
* memberOf TokenStore

    hummingbird.TokenStore.load = (serialisedData) ->
      store = new this
      store.root = serialisedData.root
      store

## toJSON
Returns a representation of the token store ready for serialisation.

* returns {Object}
* memberOf TokenStore

    hummingbird.TokenStore::toJSON = ->
      root: @root

## add
Adds a new token doc pair to the store.

By default this function starts at the root of the current store, however
it can start at any node of any token store if required.

* param {String} token The token to store the doc under
* param {Object} doc The doc to store against the token
* memberOf TokenStore

    hummingbird.TokenStore::add = (token, docId) ->
      @root[token] = []  unless @has(token)
      @root[token].push docId  if @root[token][docId] is `undefined`
      return

## has
Checks whether this key is contained within this hummingbird.TokenStore.

By default this function starts at the root of the current store, however
it can start at any node of any token store if required.

* param {String} token The token to check for
* param {Object} root An optional node at which to start
* memberOf TokenStore

    hummingbird.TokenStore::has = (token) ->
      return false  unless token
      if token of @root
        return true
      else
        return false
      return


## get
Retrieve the documents for the given token.

* param {String} token The token to get the documents for.
* returns {Array}
* memberOf TokenStore

    hummingbird.TokenStore::get = (token) ->
      @root[token] or []

## count
Number of documents for the given token

    hummingbird.TokenStore::count = (token) ->
      return 0  if not token or not @root[token]
      @root[token].length


## length

    #hummingbird.TokenStore::length = () ->
    #  return 0  if not token or not @root[token]
    #  @root[token].length


## remove
Remove the document identified by docId from the token in the store.

By default this function starts at the root of the current store, however
it can start at any node of any token store if required.

* param {String} token The token to get the documents for.
* param {String} docId The id of the document to remove from this token.
* returns {Object}
* memberOf TokenStore

    hummingbird.TokenStore::remove = (token, docId) ->
      return  if not token or not @root[token]
      loc = @root[token].indexOf(docId)
      return  if loc is -1
      @root[token].splice loc, 1
      delete @root[token]  if @root[token].length is 0
      return
