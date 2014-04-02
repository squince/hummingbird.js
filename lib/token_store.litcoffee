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
Adds to the store a new token, document 'id', and score for this token in this doc.

    hummingbird.TokenStore::add = (token, score, docId) ->
      @root[token] = {}  unless @has(token)
      @root[token][docId] = score unless docId of @root[token]
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
      @root[token] or {}

### ::count
Number of documents associated with the given token

    hummingbird.TokenStore::count = (token) ->
      return 0  if not token or not @root[token]
      Object.keys(@root[token]).length

### ::remove
Remove the document identified by docRef from each token in the store where it appears.

    hummingbird.TokenStore::remove = (docRef) ->
      Object.keys(this.root).forEach ((token) ->
        delete @root[token][docRef]
        delete @root[token] if Object.keys(@root[token]).length is 0
        return
      ), this
