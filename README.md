# Hummingbird.js

_Impossibly quick and remarkably precise autosuggest_

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
[Read more...](http://glg.github.io/hummingbird.js#toc1)
