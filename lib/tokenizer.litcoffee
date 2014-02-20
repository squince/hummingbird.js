# Tokenizer
A function making function for splitting a string into ngram
tokens suitable for short string autocomplete indexing and fuzzy
name matching.

In order to effectively boost exact matches, a start character \u0002
and an end character \u0003 are wrapped around the string and used
in the ngrams. This causes a sequence of characters at the start of
both a search query and a sought term to more tightly match than a similar
series of characters elsewhere in sought terms.

## constructor
param {Number} min The minimum number of characters to tokenize (defaults to 3)

param {Number} max The maximum number of characters to tokenize (defaults to min)

returns {object}

    hummingbird.tokenizer = (min, max) ->
      if not arguments.length or not min? or typeof min isnt 'number' or min < 1
        @min = 3
      else
        @min = min

      if arguments.length < 2 or not max? or typeof max isnt 'number' or max < min
        @max = @min
      else
        @max = max
      return

## tokenize
param {String} obj The string to convert into tokens

returns {Function}

    hummingbird.tokenizer::tokenize = (obj) ->
      return []  if not arguments.length or not obj? or obj is `undefined`
      normalized_name = '\u0002' + diacritics.remove(obj.toString()).toLowerCase() + '\u0003'

      alltokens = []
      n = @min

      while n <= @max
        # str = '\u0002' + normalized_name + '\u0003'
        buffer = []
        if normalized_name.length <= n
          buffer.push normalized_name
        else
          i = 0
          while i <= normalized_name.length - n
            buffer.push normalized_name.slice(i, i + n)
            i++
        alltokens = alltokens.concat(buffer)
        n++
      alltokens


## bigramtokenizer
A tokenizer that indexes on character bigrams.

param {String} obj The string to convert into tokens

returns {Function}

    hummingbird.bigramtokenizer = new hummingbird.tokenizer(2)

## trigramtokenizer
A tokenizer that indexes on character trigrams.

param {String} obj The string to convert into tokens

returns {Function}

    hummingbird.trigramtokenizer = new hummingbird.tokenizer(3)
