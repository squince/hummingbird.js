## Index
The object that manages everything

Most importantly it contains the inverted index of tokens
found in each name in the corpus, associated meta data, and methods
for interacting with the data

### constructor
Set _hummingbird.Index.tokenizer_ to any javascript object that has 
a method _tokenize_ that takes a string and returns an array of values 
that will be used to find this string when the index is searched.

Example:
```javascript
idx = new hummingbird.index();
idx.tokenizer = new hummingbird.tokenizer(2,3)
idx.variantStore.variants = {'steve': ['steven', 'stephen', 'stefan']}
```

    hummingbird.Index = (variantsObj) ->
      @tokenStore = new hummingbird.TokenStore
      @metaStore = new hummingbird.MetaStore
      if variantsObj?
        @variantStore = new hummingbird.VariantStore variantsObj
      else
        @variantStore = new hummingbird.VariantStore
      @eventEmitter = new hummingbird.EventEmitter
      @tokenizer = new hummingbird.tokenizer
      @utils = new hummingbird.Utils
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
      idx = new this
      idx.utils.warn 'version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version  if serializedData.index_version isnt hummingbird.index_version
      idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore)
      idx.metaStore = if serializedData.hasOwnProperty 'metaStore' then hummingbird.MetaStore.load(serializedData.metaStore) else `undefined`
      idx.variantStore = if serializedData.hasOwnProperty 'variantStore' then hummingbird.VariantStore.load(serializedData.variantStore) else `undefined`
      idx

### ::add
Add a name to the index (i.e., the tokenStore and its associated metadata to the metaStore)
Takes an Object as an argument.
* _doc.id_ = must be a unique identifier within a given index

Then, there are two options in order to have something to search:
* _doc.name_ = this string will be indexed
* _indexCallback_ = this function if provided will be called on _doc_ and must return
  the string to be indexed

Optionally includes additional arbitrary name-value pairs to be stored, but not indexed

    hummingbird.Index::add = (doc, emitEvent, indexCallback) ->
      allDocumentTokens = {}
      emitEvent = (if emitEvent is `undefined` then true else emitEvent)

      # normalize string to be tokenized
      if indexCallback
        normalized_name = @utils.normalizeString("#{indexCallback doc}")
      else
        normalized_name = @utils.normalizeString(doc['name'])

      # tokenize the doc
      tokens = @tokenizer.tokenize normalized_name
      tokens = tokens.concat @variantStore.getVariantTokens(normalized_name, @tokenizer, tokens)

      # add the tokens to the tokenStore
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

    hummingbird.Index::remove = (docRef, emitEvent) ->
      emitEvent = (if emitEvent is `undefined` then true else emitEvent)

      @metaStore.remove docRef
      @tokenStore.remove docRef
      @eventEmitter.emit 'remove', docRef, this  if emitEvent
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
      if (not query? or query.length < (@tokenizer.min - 1)) then callback []

      # search options
      numResults = if (options?.howMany is `undefined`) then 10 else Math.floor(options.howMany)
      offset = if (options?.startPos is `undefined`) then 0 else Math.floor(options.startPos)
      boost = if not options?.boostPrefix? or options?.boostPrefix then true else false
      maxScore = @utils.maxScore(query, @tokenizer, boost)

      # initialize result set vars
      docSetHash = {}
      docSetArray = []

      # normalize the query
      norm_query = @utils.normalizeString(query)
      queryTokens = @tokenizer.tokenize(norm_query)
      hasSomeToken = queryTokens.some((token) ->
        @tokenStore.has token
      , this)
      return []  unless hasSomeToken

      @utils.logTiming 'find matching docs * start'
      queryTokens.forEach ((token, i, tokens) ->
        @tokenStore.get(token).forEach ((docRef, i, documents) ->
          docScore = @utils.tokenScore(token, options)
          if docRef of docSetHash
            docSetHash[docRef] += docScore
          else
            docSetHash[docRef] = docScore
          return
        ), this
        return
      ), this
      @utils.logTiming 'find matching docs * finish'

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
      @utils.logTiming 'hash to array * start'
      for key of docSetHash
        if docSetHash[key] >= threshold
          docSetArray.push
            id: key
            score: docSetHash[key]
      @utils.logTiming 'hash to array * finish'
      @utils.logTiming 'array size = ' + docSetArray.length

      @utils.logTiming 'sort * start'
      docSetArray.sort (a, b) ->
        b.score - a.score
      @utils.logTiming 'sort * finish'

      # loop over limited return set and augment with meta
      @utils.logTiming 'add meta * start'
      results = docSetArray.slice offset, numResults
      resultSet = (results.map (result, i, results) ->
        result = @metaStore.get result.id
        result.score = results[i].score
        @utils.logTiming "id: #{result.id}, score: #{result.score}"
        return result
      , this)
      callback resultSet
      @utils.logTiming 'add meta * finish'


### ::toJSON
Returns a representation of the index ready for serialization.

    hummingbird.Index::toJSON = ->
      version: hummingbird.version
      index_version: hummingbird.index_version
      tokenStore: @tokenStore.toJSON()
      metaStore: @metaStore.toJSON()
      variantStore: @variantStore.toJSON()
