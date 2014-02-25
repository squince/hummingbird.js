# Hummingbird
Look!...  there..., in the sky...

...it's _not_ [Lucene](https://lucene.apache.org/) _nor_ [ElasticSearch](http://www.elasticsearch.org/),

...it's _not_ [Solr](https://lucene.apache.org/solr/) _nor_ [Lunr](http://lunrjs.com/),

It's **Hummingbird**.js

Impossibly quick, precise, and beautiful to behold (day _or_ night)

## Overview
Inspired by the desire to help folks _get to_ what they're looking for
without having to leave what they're doing.  Heavily influenced by
popular open source search solutions as well as GLG's
[AutoComplete](https://github.com/glg/AutoComplete).  Hummingbird's
goals are simple:

* Focus strictly on in-line name search
  (i.e., autocomplete, autosuggest, typeahead)
* Focus on speed and simplicity

To do this we decided to push as much processing as possible to the
browser and eliminate the latency and architectural complexity
introduced by server-side solutions.  Lunr.js is designed for document
search and we quickly realized that it would be no small feat to make it
scale and perform to the millions of names that we needed to support.

Thus, **Hummingbird**.js was born...

[MIT Licensed](./LICENSE)
