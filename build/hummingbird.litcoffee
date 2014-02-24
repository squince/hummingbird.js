# API

## Core

### constructor
Convenience function for instantiating a hummingbird index

    hummingbird = ->
      idx = new hummingbird.Index
      idx

### .loggingOn
Set to true or false to enable or disable logging respectively
Defaults to false

    hummingbird.loggingOn = false

### .version
Version of the hummingbird code base

    hummingbird.version = "0.2.0"

### .index_version
Version of the index data structure

    hummingbird.index_version = "2.0"
    module.exports = hummingbird  if typeof module isnt 'undefined'
