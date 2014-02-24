## MetaStore
The inverted index that maps each token in the corpus to all the names
that contain said token

### constructor

    hummingbird.MetaStore = ->
      @root = {}
      return

### .load
Loads a previously serialised token store

    hummingbird.MetaStore.load = (serialisedData) ->
      store = new this
      store.root = serialisedData.root
      store

### ::toJSON
Returns a representation of the token store ready for serialisation.

    hummingbird.MetaStore::toJSON = ->
      root: @root

### ::add
Adds a document to the meta store

    hummingbird.MetaStore::add = (doc) ->
      @root[doc['id']] = doc['obj']  unless @has(doc['id']) or doc is `undefined`
      return

### ::has
Checks whether this key is contained within this hummingbird.MetaStore.

    hummingbird.MetaStore::has = (docId) ->
      return false  unless docId
      if docId of @root
        return true
      else
        return false
      return

### ::get
Retrieve the documents for the given token

    hummingbird.MetaStore::get = (docId) ->
      @root[docId] or {}

### ::remove
Remove the document identified by docId from the token in the store

    hummingbird.MetaStore::remove = (docId) ->
      return  if not docId or not @root[docId]
      delete @root[docId]
