## Index
The object that manages everything

Most importantly it contains the inverted index of tokens
found in each name in the corpus, associated meta data, and methods
for interacting with the data

### constructor

    hummingbird.Index = ->
      @tokenStore = new hummingbird.TokenStore
      @metaStore = new hummingbird.MetaStore
      @eventEmitter = new hummingbird.EventEmitter
      @tokenizer = new hummingbird.tokenizer
      @logTimer = hummingbird.utils.logTiming
      return

### ::on
Binds handler to events emitted by the index

    hummingbird.Index::on = ->
      args = Array::slice.call(arguments)
      @eventEmitter.addListener.apply @eventEmitter, args

### ::off
Removes handler from event emitted by the index

    hummingbird.Index::off = (name, fn) ->
      @eventEmitter.removeListener name, fn

### ::load
Loads serialized index and issues a warning if the index being imported is in a different format
than what is now supported by this version of hummingbird

    hummingbird.Index.load = (serializedData) ->
      hummingbird.utils.warn 'version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version  if serializedData.index_version isnt hummingbird.index_version
      idx = new this
      idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore)
      idx.metaStore = hummingbird.MetaStore.load(serializedData.metaStore)
      idx

### ::add
Add a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
Takes an Object as an argument that must have at least 2 properties:
* _doc.id_ = must be a unique reference to the document as it is used to map to associated meta data
* _doc.name_ = the string to be indexed for autocompletion

Optionally includes additional arbitrary name-value pairs to be stored, but not indexed

    hummingbird.Index::add = (doc, emitEvent) ->
      allDocumentTokens = {}
      emitEvent = (if emitEvent is `undefined` then true else emitEvent)
      tokens = @tokenizer.tokenize(doc['name'])
      for i of tokens
        token = tokens[i]
        allDocumentTokens[token] = token.length
      Object.keys(allDocumentTokens).forEach ((token) ->
        @tokenStore.add token, doc['id']
        return
      ), this
      @metaStore.add doc
      @eventEmitter.emit 'add', doc, this  if emitEvent
      return

### ::remove
Removes the document from the index that is referenced by the 'id' property

    hummingbird.Index::remove = (doc, emitEvent) ->
      docRef = doc['id']
      emitEvent = (if emitEvent is `undefined` then true else emitEvent)
      Object.keys(@tokenStore).forEach ((token) ->
        @tokenStore.remove token, docRef
        return
      ), this

      @eventEmitter.emit 'remove', doc, this  if emitEvent
      return

### ::update
Updates the document from the index that is referenced by the 'id' property
This method is just a wrapper around `remove` and `add`

    hummingbird.Index::update = (doc, emitEvent) ->

      emitEvent = (if emitEvent is `undefined` then true else emitEvent)
      @remove doc, false
      @add doc, false

      @eventEmitter.emit 'update', doc, this  if emitEvent
      return

### ::search
Takes a callback function that has the resultSet array as its only argument.  
Optionally, takes an options object with the following possible properties
* _howMany_ - the maximum number of results to be returned (_default=10_)
* _startPos_ - how far into the sorted matched set should the returned resultset start (_default=0_)
* _scoreThreshold_ - (number between 0,1 inclusive) only matches with a score equal to or greater
  than this fraction of the maximum theoretical score will be returned in the result set (_default=0.5_, 
  includes all matches)
* _boostPrefix_ - (boolean) if _true_ provides an additional boost to results that start with the first 
  query token (_default=true_)

Finds matching names and returns them in order of best match.

    hummingbird.Index::search = (query, callback, options) ->
      if (not query? or query.length < (@tokenizer.min - 1)) then return []

      queryTokens = @tokenizer.tokenize(query)
      numResults = if (options?.howMany is `undefined`) then 10 else Math.floor(options.howMany)
      offset = if (options?.startPos is `undefined`) then 0 else Math.floor(options.startPos)
      documentSets = {}
      documentSet = []
      self = this
      maxScore = 0
      boost = if not options?.boostPrefix? or options?.boostPrefix then true else false

      hasSomeToken = queryTokens.some((token) ->
        @tokenStore.has token
      , this)
      return []  unless hasSomeToken

      self.logTimer 'Start - Find all docs that match each query token and score'
      queryTokens.forEach ((token, i, tokens) ->
        self = this
        localToken = token
        len = localToken.length
        maxScore += if boost and localToken.substring(0,1) is '\u0002' then len + 2 else len
        self.tokenStore.get(token).forEach (docRef, i, documents) ->

          docScore = if boost and localToken.substring(0,1) is '\u0002' then len + 2 else len
          if docRef of documentSets
            documentSets[docRef] += docScore
          else
            documentSets[docRef] = docScore
          return

        return
      ), this
      self.logTimer 'Finish - Find all docs that match each query token and score'

      if not options?.scoreThreshold?
        threshold = 0.5 * maxScore
      else if options?.scoreThreshold < 0
        threshold = 0
      else if options?.scoreThreshold > 1
        threshold = maxScore
      else
        threshold = options.scoreThreshold * maxScore

      # convert hash to array of hashes for sorting
      # filter out results below the threshold
      self.logTimer 'Start - Sorting'
      for key of documentSets
        if documentSets[key] >= threshold
          documentSet.push
            id: key
            score: documentSets[key]

      documentSet.sort (a, b) ->
        b.score - a.score

      self.logTimer 'Finish - Sorting'

      # loop over limited return set and augment with meta
      results = documentSet.slice offset, numResults
      resultSet = (results.map (result, i, results) ->
        result = @metaStore.get result.id
        result.score = results[i].score
        return result
      , this)
      callback resultSet


### ::toJSON
Returns a representation of the index ready for serialization.

    hummingbird.Index::toJSON = ->
      version: hummingbird.version
      index_version: hummingbird.index_version
      tokenStore: @tokenStore.toJSON()
      metaStore: @metaStore.toJSON()
