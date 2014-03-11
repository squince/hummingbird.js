# VariantStore
The inverted index that maps a name to the documents in which that name's variants occur

### constructor

    hummingbird.VariantStore = (variantsObj) ->
      #@root = {}
      @variants = {}
      @invertedVariants = {}
      @utils = new hummingbird.Utils
      if variantsObj?
        for key of variantsObj
          normKey = @utils.normalizeString(key)
          @variants[normKey] = []
          variantsObj[key].forEach ((variant, i, variants) ->
            normVariant = @utils.normalizeString(variant)
            @variants[normKey].push normVariant
            @invertedVariants[normVariant] ?= []
            @invertedVariants[normVariant].push normKey
          ), this
      return

### .load
Loads a previously serialized variant store

    hummingbird.VariantStore.load = (serializedData) ->
      store = new this
      #store.root = if serializedData.hasOwnProperty 'root' then serializedData.root
      store.variants = if serializedData.hasOwnProperty 'variants' then serializedData.variants
      store.invertedVariants = if serializedData.hasOwnProperty 'invertedVariants' then serializedData.invertedVariants
      store

### ::toJSON
Returns a representation of the variant store ready for serialization.

    hummingbird.VariantStore::toJSON = ->
      #root: @root
      variants: @variants
      invertedVariants: @invertedVariants

    ### ::add
    Adds a new variant, document 'id' pair to the store
    NO LONGER NECESSARY - ALL VARIANTS TOKENIZED AND STORED IN TOKENSTORE

    hummingbird.VariantStore::add = (full_name, score, docId) ->
      norm_name = @utils.normalizeString full_name
      # first check to see if the norm_name has variants
      if @variants.hasOwnProperty norm_name
        @root[norm_name] ?=
          score: score
          docs: []
        @root[norm_name].docs.push docId

      if @invertedVariants.hasOwnProperty norm_name
        # associate the documents for each variant with the original norm_name
        @invertedVariants[norm_name].forEach ((variant, i, variantsArray) ->
          @root[variant] ?=
            score: score
            docs: []
          @root[variant].docs.push docId
        ), this

      # then split the full name on word boundaries and check each name part
      unless norm_name is norm_name.split(/\s+/)[0]
        norm_name.split(/\s+/).forEach ((name) ->
          # check to see if each name word has any nicknames/variants
          if @variants.hasOwnProperty name
            @root[name] ?=
              score: score
              docs: []
            @root[name].docs.push docId
          if @invertedVariants.hasOwnProperty name
            # associate the documents for each variant with the original norm_name
            @invertedVariants[name].forEach ((variant, i, variantsArray) ->
              @root[variant] ?=
                score: score
                docs: []
              @root[variant].docs.push docId
            ), this
        ), this
      return
    ###

    ### ::has
    Checks whether this key is contained within this hummingbird.VariantStore.

    hummingbird.VariantStore::has = (variant) ->
      norm_variant = @utils.normalizeString variant
      return false  unless norm_variant
      if norm_variant of @root
        return true
      else
        return false
      return
    ###

    ### ::get
    Retrieve the documents for the given variant

    hummingbird.VariantStore::get = (variant) ->
      @root[variant].docs or []
    ###

    ### ::count
    Number of documents associated with the given variant

    hummingbird.VariantStore::count = (variant) ->
      return 0  if not variant or not @root[variant]
      @root[variant].docs.length
    ###

    ### ::remove
    Remove the document identified by docId from the variant in the store

    hummingbird.VariantStore::remove = (docRef) ->
      Object.keys(this.root).forEach ((variant) ->
        loc = @root[variant].indexOf(docRef)
        return  if loc is -1
        @root[variant].splice loc, 1
        delete @root[variant]  if @root[variant].length is 0
        return
      ), this
     ###
