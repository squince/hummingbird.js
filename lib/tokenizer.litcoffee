## Tokenizer
A flexible ngram tokenizer that can index a string using a range of lengths
for substrings suitable for autocomplete indexing and fuzzy name matching

### constructor

    hummingbird.tokenizer = (min, max) ->
      @utils = new hummingbird.Utils
      if not arguments.length or not min? or typeof min isnt 'number' or min < 1
        @min = 3
      else
        @min = min

      if arguments.length < 2 or not max? or typeof max isnt 'number' or max < min
        @max = @min
      else
        @max = max
      return

### ::tokenize
Splits a string into ngram tokens

To boost exact matches, a start character \u0002 and an end character \u0003
are wrapped around the string and used in the ngrams. This causes a sequence
of characters at the start of both a search query and a sought term to more
tightly match than a similar series of characters elsewhere in sought terms.

See utils.normalizeString()

    hummingbird.tokenizer::tokenize = (name, suffixBoost) ->
      norm_name = @utils.normalizeString name, suffixBoost
      return [] unless norm_name?

      alltokens = {}
      n = @min

      while n <= @max
        if norm_name.length <= n
          alltokens[norm_name] = null unless norm_name is '\u0002 \u0003'
        else
          i = 0
          while i <= norm_name.length - n
            alltokens[norm_name.slice(i, i + n)] = null unless norm_name is '\u0002 \u0003'
            i++
        n++
      return Object.keys(alltokens)
