## Examples

### TLDR
You can index any JavaScript object you like, and hummingbird.js will
merrily make it searchable. No schema needed, it just matches all the
things.

```javascript
var idx = new hummingbird.Index();
idx.add({id: 1, name: 'Hi Mom'});
idx.add({id: 2, name: 'Sup Dad'});
idx.search('Dad', function(results){
  results.forEach(function(doc){
   console.log(doc);
  });
});
```


### html script
The most obvious way to use hummingbird.js is from within an html page.
See a working example of [typeahead here](http://glg.github.io/hummingbird.js/examples/html-script/index.html)

Special thanks to [socrata.com](https://opendata.socrata.com/) for
making a wide range of interesting data available

### coffee repl
Yep, you can even run this from the command-line.  This can be useful if
making changes to the code or if you simply want to experiment with the
data you are indexing or configuration parameters.

1. Clone the [repo](https://github.com/glg/hummingbird.js) or pull down
   just this
   [subdirectory](https://github.com/glg/hummingbird.js/tree/master/examples)
    
1. _$ npm install_

    from inside the ./coffee-repl subdirectory

1. _$ coffee repl.coffee_

    builds in memory index, serializes it out
    to disk, and displays interactive query prompt

