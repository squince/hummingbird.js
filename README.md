# Hummingbird
Look!...  there..., in the sky... it's _not_ [Lucene](https://lucene.apache.org/) _nor_ [ElasticSearch](http://www.elasticsearch.org/), _not_ [Solr](https://lucene.apache.org/solr/) _nor_ [Lunr](http://lunrjs.com/),

It's **Hummingbird**.js

Impossibly quick, precise, and beautiful to behold (day _and_ night)

<script src="hummingbird.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript" charset="utf-8">
  var idx

  $(document).ready(function () {
    $.ajaxSetup({ cache: false })
    $("#searchTerm").keyup(searchText).focus()
    console.time("load")
    $.getJSON('examples/coffee-repl/idx-countries.json')
    .success(function (indexData) {
      idx = hummingbird.Index.load(indexData)
    })
    console.timeEnd("load")
  })
  function searchText() {
    $("#matchResultsList").empty();
    var searchTerm = $("#searchTerm").val().trim();
    if (!searchTerm) {
      return;
    }
    console.time('search')
    idx.search(searchTerm, showResults)
    console.timeEnd('search')
  }

  function showResults(results) {
    var frag = document.createDocumentFragment();

    $.each(results, function( i, val ) {
      var li = document.createElement("li");
      li.innerHTML = val.name + " -> " + val.lat + "&deg; latitude / " + val.long + "&deg; longitude";
      frag.appendChild(li);
    });
    $("#matchResultsList").append(frag);
  }
</script>

<span>Here's a super simple example using trigrams of countries with avg latitude/longitude meta data</span>
<br/>
<form>
   <input type="text" id="searchTerm" size="50" placeholder="United St...">
   <ul id="matchResultsList">
   </ul>
</form>


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
