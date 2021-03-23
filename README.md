## Overview

_Impossibly quick and remarkably precise_

Misspellings and nicknames are no match for this fast and forgiving typeahead engine.
You can index any JavaScript object you like with _id_ and _name_, and
hummingbird.js will merrily make it searchable. No schema needed, it
just matches against _name_ and returns the document.

* _id_ serves as the key, this needs to be unique in an index.
* _name_ is the indexed text, just build up a property.
Any other properties are just carried along, but are not indexed.

```javascript
    var idx = new hummingbird.Index();
    idx.add({id: 1, name: 'Hi Mom', female: true});
    idx.add({id: 2, name: 'Sup Dad', male: true});
    idx.search('Dad', function(results){
        results.forEach(function(doc){
            console.log(doc);
        });
    });
```

#### Browser-side Search
Hummingbird is designed to run 100% in the browser for reasonably sized
lists of names (i.e., those that will fit into the users available RAM).

#### What goes into a hummingbird index
Hummingbird is specifically focused on typeahead results, but often
you'll need to display more than just the name of something for the user
to make a selection decision.  To that end, the ideal hummingbird index
should contain:

* the name of the thing on which to select
* a unique id on which one might take action
* meta data that enables the user to disambiguate between similarly
named items
* meta data that enables further action on selected items.

e.g.,

* *name:* Steve Quince
* *id:* 1235
* *company:* abc corp
* *location:* Boston, MA
* *telephone:* 617-555-1212
* *email:* myemail@address.com
### Install
_$ npm install hummingbird_

### License
[MIT Licensed](./LICENSE)

## Inspiration

Inspired by the desire to help folks _get to_ what they want
_without leaving_ what they're doing.  Hummingbird's
goals are simple:

* Unlike other search solutions, focus strictly on names of
persons, places, and things for autocomplete, autosuggest,
and typeahead applications
* Prioritize speed and simplicity
* Enable finding near matches (e.g., substring matches, misspellings, nicknames)

To do this we decided to push as much processing as possible to the
browser and eliminate the latency and architectural complexity
introduced by server-side solutions.

## Features

### Search Options
Customizable _options_ javascript object can be passed into the
hummingbird.index.search method to tune various search-time
features.

_boostPrefix_ - (boolean) if _true_ provides an additional boost to results that start with the first
  query token (_default=true_)

_scoreThreshold_ - (number between 0,1 inclusive) only matches with a score equal to or greater
  than this fraction of the maximum theoretical score will be returned in the result set (_default=0.5_,
  includes all matches)

_howMany_ - (number) the maximum number of results to be returned (_default=10_)

_startPos_ - (number) how far into the sorted matched set should the returned resultset start (_default=0_)

_secondarySortField_ - (string) if provided, results are sorted first by score descending,
  then by the property represented by this string (_default='name'_)

_secondarySortOrder_ - (string; 'asc' or 'desc') optionally specifies whether sort on secondarySortField
  is ascending or descending (_default='asc'_)

```javascript
// example
var options = {
  'boostPrefix': false,
  'scoreThreshold': 0.75,
  'howMany': 5,
  'startPos': 5,
  'secondarySortField': 'title',
  'secondarySortOrder': 'desc'
};
idx.search('bob', printResults(), options);
```

### Arbitrary Meta Data
To include a name in the hummingbird index, you pass the _add_ method a
'document' that is a javascript object with an arbitrary collection of key-value
pairs.  This document must contain an 'id' key that is a unique identifier for this
document within a given index.

Additionally, choose one of the following two options in order to have something to search:

* _doc.name_ = this string will be indexed, unless _indexCallback_ is
provided
* _indexCallback_ = this function if provided will be called on _doc_ and must return
  the string to be indexed

All other key-value pairs wil be stored, but *not* indexed.
These additional key-value pairs are simply added to the index *as is* and returned as part of
the result set. This makes it really easy to provide autosuggest on the name of
anything (e.g., a person, company, project description, email subject,
whatever) AND display any additional metadata that provides additional
context to the user.  For example, you might include a person's current
employer, their title, geographic location, telephone number, email
address, etc.

### Ranking Across Indexes
Scoring results in response to a query is based soley on how
names are tokenized.  Therefore, as long as different indexes are tokenized in the
same way you can compare scores across them and rank documents by best
match regardless from which index they came.  Let's say you use
trigrams, for example, to build a person name index and a project name index.  Now
at search time you can allow your users to type into a single search box
and it will "magically understand" whether they're looking for a person
or a project (or both).  You can merge results into a single list or
denote them as different types of things.  You have all the
flexibility you need to provide the users what they need to streamline
their workflow.

### Name Variants
It is possible to supply a set of name variants (aka, nicknames; aka, synonyms)
for each index individually.  If a set of name variants is provided, searches for
alternate names will be displayed where appropriate.  The examples
include name variants for countries (e.g., _America_ as a variant for
_United States_).

In this example above, searches for _America_, _USA_, or _U.S.A._ will
return the documents with _United States_.  Searches for _United
States_, however, will **not** return documents with _America_.  This is
by design.  For the latter search, you would create a variant with
_America_ as the primary key and _United States_ as a nickname/variant.

```javascript
// example
const variants = {
      "United States": ["America","USA","U.S.A."],
      "America": ["United States"]
  }
const hum = new Hummingbird(variants, opts);
```


## Contribute
1. Clone or fork the source, [github.com/glg/hummingbird.js](http://github.com/glg/hummingbird.js), then
1. `$ npm install`
1. `$ npm test`
    - Requires [Node.js](https://nodejs.org/) 14.2 or newer to run tests
    - execute individual test modules using `$ npm test --mod=<filename>`
    - e.g., `$ npm test --mod=ngram_search`
