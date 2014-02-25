## TokenStore
The inverted index that maps each token in the corpus to all the names
that contain said token

### constructor

    hummingbird.TokenStore = ->
      @root = {}
      return

### .load
Loads a previously serialized token store

    hummingbird.TokenStore.load = (serializedData) ->
      store = new this
      store.root = serializedData.root
      store

### ::toJSON
Returns a representation of the token store ready for serialization.

    hummingbird.TokenStore::toJSON = ->
      root: @root

### ::add
Adds a new token, document 'id' pair to the store

    hummingbird.TokenStore::add = (token, docId) ->
      @root[token] = []  unless @has(token)
      @root[token].push docId  if @root[token][docId] is `undefined`
      return

### ::has
Checks whether this key is contained within this hummingbird.TokenStore.

    hummingbird.TokenStore::has = (token) ->
      return false  unless token
      if token of @root
        return true
      else
        return false
      return


### ::get
Retrieve the documents for the given token

    hummingbird.TokenStore::get = (token) ->
      @root[token] or []

### ::count
Number of documents associated with the given token

    hummingbird.TokenStore::count = (token) ->
      return 0  if not token or not @root[token]
      @root[token].length

### ::remove
Remove the document identified by docId from the token in the store

    hummingbird.TokenStore::remove = (token, docId) ->
      return  if not token or not @root[token]
      loc = @root[token].indexOf(docId)
      return  if loc is -1
      @root[token].splice loc, 1
      delete @root[token]  if @root[token].length is 0
      return
