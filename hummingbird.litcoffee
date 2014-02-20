# Hummingbird Core
Convenience for instantiating a hummingbird index

    hummingbird = ->
      idx = new hummingbird.Index
      idx

    hummingbird.version = "@@VERSION"
    hummingbird.index_version = "@@INDEX_VERSION"
    module.exports = hummingbird  if typeof module isnt 'undefined'
