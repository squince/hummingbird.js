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
  if (!str) return '';
  let normStr = str.toString();
  normStr = normStr.toLowerCase();
  normStr = diacritics.remove(normStr);
  normStr = normStr.replace(REG_EXP_START_INDICATOR, '');
  return START_OF_STRING_INDICATOR.concat(normStr);
};

/* maxScore
* Returns the max score for a given string
*/
export function maxScore(phrase, tokenizer, prefixBoost) {
  let score = 0;
  if (!phrase) return score;

  for (const token of tokenizer.tokenize(phrase)) {
    const tokScore = this.tokenScore(token, false, prefixBoost);
    score += tokScore;
  };
  return score;
};

/* tokenScore
* Returns the score for the given token
* default to boosting prefix matches unless explicitly set to false
*/
export function tokenScore(token, isVariant, prefixBoost=true) {
  let score = token.length;
  if (prefixBoost && token.substring(0, 1) === START_OF_STRING_INDICATOR) score += 0.2;
  if (isVariant) score -= 0.4;

  return score;
};

export function setMinThresholds({scoreThreshold, queryTokensLength, maxScore}) {
  let minScore, minNumQueryTokens;
  if (scoreThreshold <= 0) {
    minScore = 0;
    minNumQueryTokens = queryTokensLength;
  } else if (scoreThreshold >= 1) {
    minScore = maxScore;
    minNumQueryTokens = 0;
  } else {
    minScore = scoreThreshold * maxScore;
    minNumQueryTokens = Math.ceil(queryTokensLength * (1 - scoreThreshold));
  }
  return { minScore, minNumQueryTokens };
};

export function getMatchingDocs({ queryTokens, boostPrefix, loggingOn, tokenStore, minNumQueryTokens }) {
  const docSetHash = {};
  queryTokens.forEach((function(token, i, tokens) {
    const NOT_VARIANT = false;
    const IS_VARIANT = true;
    const docNameScore = this.tokenScore(token, NOT_VARIANT, boostPrefix);
    const docVariantScore = this.tokenScore(token, IS_VARIANT, boostPrefix);
    let startMatchTime, startVariantMatch;

    if (loggingOn) startMatchTime = this.logTiming(`'${token}' score start`);
    // name matches
    for (const docRef in tokenStore.get(token, NOT_VARIANT)) {
      if (!(docRef in docSetHash) && i <= minNumQueryTokens) {
        docSetHash[docRef] = docNameScore;
      } else if (docRef in docSetHash) {
        docSetHash[docRef] += docNameScore;
      }
      if (loggingOn) this.logTiming(`name token match ${token} score ${docNameScore}`);
    }

    if (loggingOn) {
      startVariantMatch = this.logTiming(`\t\toriginal name:\t\t${Object.keys(tokenStore.get(token, NOT_VARIANT)).length} matched docs\t`, startMatchTime);
    }
    // variant matches
    for (const docRef in tokenStore.get(token, IS_VARIANT)) {
      if (!(docRef in docSetHash) && i <= minNumQueryTokens) {
        docSetHash[docRef] = docVariantScore;
      } else if (docRef in docSetHash) {
        docSetHash[docRef] += docVariantScore;
      }
      if (loggingOn) this.logTiming(`name token match ${token} score ${docVariantScore}`);
    }

    if (loggingOn) {
      this.logTiming(`\t\tvariant matches:\t${Object.keys(tokenStore.get(token, IS_VARIANT)).length} matched docs\t`, startVariantMatch);
    }
  }), this);
  return docSetHash;
};
