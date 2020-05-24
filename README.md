# Hummingbird.js

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
### In Browser
Hummingbird is designed to run 100% in the browser for reasonably sized
lists of names (i.e., those that will fit into the users available RAM).

### What goes into a hummingbird index
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
