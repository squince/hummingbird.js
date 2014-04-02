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
      re_start = /^\u0002/
      re_end = /\u0003$/
      str = diacritics.remove((str.toString()).toLowerCase())
      str = str.replace re_start, ''
      str = str.replace re_end, ''
      return ('\u0002' + str + '\u0003')

### .maxScore
Returns the max score for a given string

    hummingbird.Utils::maxScore = (phrase, tokenizer, boost) ->
      score = 0
      return score if not phrase?
      (tokenizer.tokenize phrase).forEach ((token, i, tokens) ->
        score += @prefixBoost(@tokenScore(token, false), boost, token)
      ), this
      return score

### .tokenScore
Returns the score for the given token

    hummingbird.Utils::tokenScore = (token, fromVariant) ->
      fromVariant ?= false
      score = token.length
      score -= 0.2 if fromVariant
      return score


### .prefixBoost
Boosts the score for the given token if appropriate

    hummingbird.Utils::prefixBoost = (score, boost, token) ->
      score += 1 if boost and token.substring(0,1) is '\u0002'
      return score

