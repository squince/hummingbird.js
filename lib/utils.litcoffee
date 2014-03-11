## Utils
Collection of utility functions

    hummingbird.Utils = () ->
      @root = {}
      return

### ::warn
logs a warning message to the console

    hummingbird.Utils::warn = (message) ->
      console.warn message if console.warn

### .logTiming
logs a message to the console preceded by time of day

    hummingbird.Utils::logTiming = (msg) ->
      if console.log and hummingbird.loggingOn
        d = new Date()
        console.log d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' - ' + msg

### .normalizeString
takes a string and normalizes it for case and diacritics

    hummingbird.Utils::normalizeString = (str) ->
      return ('\u0002' + diacritics.remove((str.toString()).toLowerCase()) + '\u0003')

### .maxScore
Returns the max score for a given string

    hummingbird.Utils::maxScore = (phrase, tokenizer, boost) ->
      score = 0
      return score if not phrase?
      (tokenizer.tokenize phrase).forEach ((token, i, tokens) ->
        score += @tokenScore token, boost
      ), this
      return score

### .tokenScore
Returns the score for the given token

    hummingbird.Utils::tokenScore = (token, boost) ->
      len = token.length
      score = if boost and token.substring(0,1) is '\u0002' then len + 2 else len

