# Index
The object that manages everything
most importantly it contains the inverted index of tokens
found in each name in the corpus

    hummingbird.Index = ->
      @tokenStore = new hummingbird.TokenStore
      @eventEmitter = new hummingbird.EventEmitter
      @tokenizer = new hummingbird.tokenizer
      @logTimer = hummingbird.utils.logTiming
      return

## Index Events
Bind a handler to events being emitted by the index.

param {String} [eventName] The events to bind to the function
param {Function} handler The serialised set to load
memberOf Index

    hummingbird.Index::on = ->
      args = Array::slice.call(arguments)
      @eventEmitter.addListener.apply @eventEmitter, args

Removes a handler from an event being emitted by the index.

param {String} eventName The events from which to remove the function
param {Function} handler The serialised set to load
memberOf Index

    hummingbird.Index::off = (name, fn) ->
      @eventEmitter.removeListener name, fn

## Index Load
Loads a previously serialised index.

Issues a warning if the index being imported was serialised
by a different version of hummingbird.

param {Object} serialisedData The serialised set to load.
returns {hummingbird.Index}
memberOf Index

    hummingbird.Index.load = (serialisedData) ->
      hummingbird.utils.warn 'version mismatch: current ' + hummingbird.index_version + ' importing ' + serialisedData.index_version  if serialisedData.index_version isnt hummingbird.index_version
      idx = new this
      idx.tokenStore = hummingbird.TokenStore.load(serialisedData.tokenStore)
      idx

## Index Add
Add a name to the index so that it is available to choose from results

An 'add' event is emitted with the document that has been added and the index
the document has been added to. This event can be silenced by passing false
as the second argument to add.

param {Object} doc The document to add to the index.
param {Boolean} emitEvent Whether or not to emit events, default true.
memberOf Index

    hummingbird.Index::add = (doc, emitEvent) ->

      allDocumentTokens = {}

      emitEvent = (if emitEvent is `undefined` then true else emitEvent)

      fieldTokens = this.tokenizer.tokenize(doc['name'])
      for i of fieldTokens
        token = fieldTokens[i]
        allDocumentTokens[token] = token.length

      Object.keys(allDocumentTokens).forEach ((token) ->
        @tokenStore.add token, doc['id']
        return
      ), this

      @eventEmitter.emit 'add', doc, this  if emitEvent
      return

## Index Remove
Removes a document from the index.

To make sure documents no longer show up in search results they can be
removed from the index using this method.

The document passed only needs to have the same id value as the
document that was added to the index, they could be completely different
objects.

A 'remove' event is emitted with the document that has been removed and the index
the document has been removed from. This event can be silenced by passing false
as the second argument to remove.

param {Object} doc The document to remove from the index.
param {Boolean} emitEvent Whether to emit remove events, defaults to true
memberOf Index

    # Need to support removing names in our updates (not in here, but in the external
    # update mechanism that calls hummingbird
    hummingbird.Index::remove = (doc, emitEvent) ->
      docRef = doc['id']
      emitEvent = (if emitEvent is `undefined` then true else emitEvent)
      Object.keys(@tokenStore).forEach ((token) ->
        @tokenStore.remove token, docRef
        return
      ), this

      @eventEmitter.emit 'remove', doc, this  if emitEvent
      return

## Index Update
Updates a document in the index.

When a document contained within the index gets updated, fields changed,
added or removed, to make sure it correctly matched against search queries,
it should be updated in the index.

This method is just a wrapper around `remove` and `add`

An 'update' event is emitted with the document that has been updated and the index.
This event can be silenced by passing false as the second argument to update. Only
an update event will be fired, the 'add' and 'remove' events of the underlying calls
are silenced.

param {Object} doc The document to update in the index.
param {Boolean} emitEvent Whether to emit update events, defaults to true
see Index.prototype.remove
see Index.prototype.add
memberOf Index

    hummingbird.Index::update = (doc, emitEvent) ->

      emitEvent = (if emitEvent is `undefined` then true else emitEvent)
      @remove doc, false
      @add doc, false

      @eventEmitter.emit 'update', doc, this  if emitEvent
      return

## Index Search
Finds the best matching names and returns them in order of best match

param {String} query The query to search the index with
param {Number} howMany How many results to return
param {String} startPos Starting offset if paging through results is desired
returns {Object}
memberOf Index

    hummingbird.Index::search = (query, howMany, startPos) ->
      queryTokens = @tokenizer.tokenize(query)
      numResults = (if (howMany is `undefined`) then 10 else howMany)
      offset = (if (startPos is `undefined`) then 0 else startPos)
      documentSets = {}
      documentSet = []
      self = this
      hasSomeToken = queryTokens.some((token) ->
        @tokenStore.has token
      , this)
      return []  unless hasSomeToken

      # for every token in the user's query
      #  * retrieve all of the associated documents
      #  * and add to the documentSets Object with score
      self.logTimer 'Start - Find all docs that match each query token and score'
      queryTokens.forEach ((token, i, tokens) ->
        self = this
        localToken = token
        self.tokenStore.get(token).forEach (docRef, i, documents) ->
          docScore = localToken.length

          if docRef of documentSets
            documentSets[docRef] = documentSets[docRef] + docScore
          else
            documentSets[docRef] = docScore
          return

        return
      ), this
      self.logTimer 'Finish - Find all docs that match each query token and score'

      # convert hash to array of hashes for sorting
      index = 0
      self.logTimer 'Start - Sorting'
      for key of documentSets
        documentSet.push index

        documentSet[index] =
          id: key
          score: documentSets[key]

        index++
      documentSet.sort (a, b) ->
        b.score - a.score

      self.logTimer 'Finish - Sorting'
      documentSet.slice offset, numResults


## Index toJSON
Returns a representation of the index ready for serialisation.

returns {Object}
memberOf Index

    hummingbird.Index::toJSON = ->
      version: hummingbird.version
      index_version: hummingbird.index_version
      tokenStore: @tokenStore.toJSON()
