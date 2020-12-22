const diacritics = require('diacritics');

(function() {
  // Utils

  // Collection of utility functions
  hummingbird.Utils = function() {
    this.root = {};
  };

  // warn
  // logs a warning message to the console
  hummingbird.Utils.prototype.warn = function(message) {
    if (console.warn) {
      return console.warn(message);
    }
  };

  // .debugLog
  // logs a debug message to the console
  hummingbird.Utils.prototype.debugLog = function(msg) {
    return console.log(`${msg}`);
  };

  // .logTiming
  // logs a message to the console preceded by time of day
  hummingbird.Utils.prototype.logTiming = function(msg, s) {
    var d;
    d = new Date();
    if (s != null) {
      console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg} in ${d - s} ms`);
    } else {
      console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg}`);
    }
    return d;
  };

  // .normalizeString
  // takes a string and normalizes it for case and diacritics
  hummingbird.Utils.prototype.normalizeString = function(str) {
    var re_start;
    re_start = /^\u0002/;
    str = diacritics.remove((str.toString()).toLowerCase());
    str = str.replace(re_start, '');
    return '\u0002' + str;
  };

  // .maxScore
  // Returns the max score for a given string
  hummingbird.Utils.prototype.maxScore = function(phrase, tokenizer, prefixBoost) {
    var score;
    score = 0;
    if (phrase == null) {
      return score;
    }
    (tokenizer.tokenize(phrase)).forEach((function(token, i, tokens) {
      return score += this.tokenScore(token, false, prefixBoost);
    }), this);
    return score;
  };

  // .tokenScore
  // Returns the score for the given token
  hummingbird.Utils.prototype.tokenScore = function(token, isVariant, prefixBoost) {
    var score;
    if (isVariant == null) {
      isVariant = false;
    }
    if (prefixBoost == null) {
      prefixBoost = true;
    }
    score = token.length;
    if (prefixBoost && token.substring(0, 1) === '\u0002') {
      score += 0.2;
    }
    if (isVariant) {
      score -= 0.4;
    }
    return score;
  };

}).call(this);
