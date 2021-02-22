import diacritics from 'diacritics';

/* Utils
* Collection of utility functions
*/

const START_OF_STRING_INDICATOR = "\u0002";
const REG_EXP_START_INDICATOR = /^\u0002/;

/* error
* logs an error message to the console and returns a new Error object
*/
export function error(message) {
  if (console.error) {
    console.error(message);
    return new Error(message);
  }
};

/* warn
* logs a warning message to the console
*/
export function warn(message) {
  if (console.warn) {
    return console.warn(message);
  }
};

/* debugLog
* logs a debug message to the console
*/
export function debugLog(msg) {
  return console.log(`${msg}`);
};

/* logTiming
* logs a message to the console preceded by time of day
*/
export function logTiming(msg, s) {
  const d = new Date();
  if (s) {
    console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg} in ${d - s} ms`);
  } else {
    console.log(`${d.toTimeString().split(' ')[0]}.${d.getMilliseconds()} - ${msg}`);
  }
  return d;
};

/* normalizeString
* takes a string and normalizes it for case and diacritics
*/
export function normalizeString(str) {
  let newStr = diacritics.remove((str.toString()).toLowerCase()).replace(REG_EXP_START_INDICATOR, '');
  return START_OF_STRING_INDICATOR.concat(newStr);
};

/* maxScore
* Returns the max score for a given string
*/
export function maxScore(phrase, tokenizer, prefixBoost) {
  let score = 0;
  if (!phrase) return score;

  for (const token in tokenizer.tokenize(phrase)) {
    score += this.tokenScore(token, false, prefixBoost);
  };
  return score;
};

/* tokenScore
* Returns the score for the given token
*/
export function tokenScore(token, isVariant, prefixBoost) {
  // default to boosting prefix matches unless explicitly set to false
  const boostPrefixMatch = prefixBoost == null ? true : prefixBoost;
  let score = token.length;
  if (boostPrefixMatch && token.substring(0, 1) === START_OF_STRING_INDICATOR) score += 0.2;
  if (isVariant) score -= 0.4;

  return score;
};
