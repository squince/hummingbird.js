const Index = require('./index');

(function() {
  // API
  // Core
  // constructor
  // Convenience function for instantiating a hummingbird index
  var hummingbird;

  hummingbird = function(variantsObj) {
    var idx;
    return idx = new Index(variantsObj);
  };

  // .loggingOn
  // Set to true or false to enable or disable logging respectively
  // Defaults to false
  hummingbird.loggingOn = false;

  // .version
  // Version of the hummingbird code base
  hummingbird.version = "@@VERSION";

  // .index_version
  // Version of the index data structure
  hummingbird.index_version = "@@INDEX_VERSION";

  if (typeof module !== 'undefined' && module !== null) {
    module.exports = hummingbird;
  }

}).call(this);
