## utils
For Debugging Only

    hummingbird.utils = {}

### .warn
logs a warning message to the console

    hummingbird.utils.warn = (message) ->
      console.warn message if console.warn

### .logTiming
logs a message to the console preceded by time of day

    hummingbird.utils.logTiming = (msg) ->
      if console.log and hummingbird.loggingOn
        d = new Date()
        console.log d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' - ' + msg
