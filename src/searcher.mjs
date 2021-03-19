import * as Utils from "./utils.mjs";

export function getMatchingDocs({ queryTokens=[], tokenStore, boostPrefix=false, loggingOn=false, minNumQueryTokens=0 }) {
  const docSetHash = {};
  queryTokens.forEach((function(token, i, tokens) {
    const NOT_VARIANT = false;
    const IS_VARIANT = true;
    const docNameScore = Utils.tokenScore(token, NOT_VARIANT, boostPrefix);
    const docVariantScore = Utils.tokenScore(token, IS_VARIANT, boostPrefix);
    let startMatchTime, startVariantMatch;

    if (loggingOn) startMatchTime = Utils.logTiming(`'${token}' score start`);
    // name matches
    for (const docRef in tokenStore.get(token, NOT_VARIANT)) {
      if (!(docRef in docSetHash) && i <= minNumQueryTokens) {
        docSetHash[docRef] = docNameScore;
      } else if (docRef in docSetHash) {
        docSetHash[docRef] += docNameScore;
      }
      if (loggingOn) Utils.logTiming(`name token match ${token} score ${docNameScore}`);
    }

    if (loggingOn) {
      startVariantMatch = Utils.logTiming(`\t\toriginal name:\t\t${Object.keys(tokenStore.get(token, NOT_VARIANT)).length} matched docs\t`, startMatchTime);
    }
    // variant matches
    for (const docRef in tokenStore.get(token, IS_VARIANT)) {
      if (!(docRef in docSetHash) && i <= minNumQueryTokens) {
        docSetHash[docRef] = docVariantScore;
      } else if (docRef in docSetHash) {
        docSetHash[docRef] += docVariantScore;
      }
      if (loggingOn) Utils.logTiming(`name token match ${token} score ${docVariantScore}`);
    }

    if (loggingOn) {
      Utils.logTiming(`\t\tvariant matches:\t${Object.keys(tokenStore.get(token, IS_VARIANT)).length} matched docs\t`, startVariantMatch);
    }
  }));
  return docSetHash;
};
