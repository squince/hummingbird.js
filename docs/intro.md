## Inspiration
Inspired by the desire to help folks _get to_ what they're looking for
without having to leave what they're doing.  Heavily influenced by
popular open source search solutions as well as GLG's
[AutoComplete](https://github.com/glg/AutoComplete).  Hummingbird's
goals are simple:

* Focus strictly on in-line name search (i.e., autocomplete, autosuggest, typeahead)
* Focus on speed and simplicity
* Enable finding near matches (e.g., misspellings, nicknames, substring matches)

To do this we decided to push as much processing as possible to the
browser and eliminate the latency and architectural complexity
introduced by server-side solutions.  Lunr.js is designed for document
search and we quickly realized that it would be no small feat to make it
scale and perform to the millions of names that we needed to support.

Thus, **Hummingbird**.js was born...

[MIT Licensed](./LICENSE)
