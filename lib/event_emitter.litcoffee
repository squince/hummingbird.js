# EventEmitter
hummingbird.EventEmitter is an event emitter for hummingbird. It manages adding and removing event handlers and triggering events and their handlers.

## constructor

    hummingbird.EventEmitter = ->
      @events = {}
      return

## addListener
Binds a handler function to a specific event(s).
Can bind a single function to many different events in one call.

* param {String} [eventName] The name(s) of events to bind this function to.
* param {Function} handler The function to call when an event is fired.
* memberOf EventEmitter

    hummingbird.EventEmitter::addListener = ->
      args = Array::slice.call(arguments)
      fn = args.pop()
      names = args
      throw new TypeError('last argument must be a function')  if typeof fn isnt 'function'
      names.forEach ((name) ->
        @events[name] = []  unless @hasHandler(name)
        @events[name].push fn
        return
      ), this
      return

## removeListener
Removes a handler function from a specific event.

* param {String} eventName The name of the event to remove this function from.
* param {Function} handler The function to remove from an event.
* memberOf EventEmitter

    hummingbird.EventEmitter::removeListener = (name, fn) ->
      return  unless @hasHandler(name)
      fnIndex = @events[name].indexOf(fn)
      @events[name].splice fnIndex, 1
      delete @events[name]  unless @events[name].length
      return


## emit
Calls all functions bound to the given event.
Additional data can be passed to the event handler as arguments to `emit`
after the event name.

* param {String} eventName The name of the event to emit.
* memberOf EventEmitter

    hummingbird.EventEmitter::emit = (name) ->
      return  unless @hasHandler(name)
      args = Array::slice.call(arguments, 1)
      @events[name].forEach (fn) ->
        fn.apply `undefined`, args
        return
      return


## hasHandler
Checks whether a handler has ever been stored against an event.

* param {String} eventName The name of the event to check.
* private
* memberOf EventEmitter

    hummingbird.EventEmitter::hasHandler = (name) ->
      name of @events
