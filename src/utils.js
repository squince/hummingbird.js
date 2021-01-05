import diacritics from 'diacritics';

/** Utils
* Collection of utility functions
*/

/** error
* logs an error message to the console and returns a new Error object
*/
export function error(message) {
  if (console.error) {
    console.error(message);
    return new Error(message);
  }
};

/** warn
* logs a warning message to the console
*/
export function warn(message) {
  if (console.warn) {
    return console.warn(message);
  }
};

/** debugLog
* logs a debug message to the console
*/
export function debugLog(msg) {
  return console.log(`${msg}`);
};

/** logTiming
* logs a message to the console preceded by time of day
*/
export function logTiming(msg, s) {
  var d;
  d = new Date();
  if (s != null) {
    console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg} in ${d - s} ms`);
  } else {
    console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg}`);
  }
  return d;
};

/** normalizeString
* takes a string and normalizes it for case and diacritics
*/
export function normalizeString(str) {
  var re_start;
  re_start = /^\u0002/;
  str = diacritics.remove((str.toString()).toLowerCase());
  str = str.replace(re_start, '');
  return '\u0002' + str;
};

/** maxScore
* Returns the max score for a given string
*/
export function maxScore(phrase, tokenizer, prefixBoost) {
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

/** tokenScore
* Returns the score for the given token
*/
export function tokenScore(token, isVariant, prefixBoost) {
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
