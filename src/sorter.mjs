import * as Utils from "./utils.mjs";

function transformDocSetHashToArray({ query, docSetHash, metaStore, minScore, secondarySortField, loggingOn }) {
  const startHashArray = new Date();
  const docSetArray = [];
  if (loggingOn) Utils.logTiming('hash to sorted array\n');
  for (let key in docSetHash) {
    if (docSetHash[key] >= minScore) {
      // exact match?
      const exactMatch = Utils.normalizeString(query) === Utils.normalizeString(metaStore.get(key).name) ? true : false;
      // Make fields we retrieve optionally include custom secondarySortField value
      if (secondarySortField === 'name') {
        docSetArray.push({
          id: key,
          score: exactMatch ? docSetHash[key] + 0.1 : docSetHash[key],
          name: metaStore.get(key).name
        });
      } else {
        docSetArray.push({
          id: key,
          score: exactMatch ? docSetHash[key] + 0.1 : docSetHash[key],
          name: metaStore.get(key).name,
          custSortField: metaStore.get(key)[secondarySortField] != null ? metaStore.get(key)[secondarySortField] : void 0
        });
      }
    }
  }
  return { docSetArray, startHashArray };
};

// filter out results below the minScore
// boost exact matches - consciously does not convert diacritics, but uncertain whether that's best
export function orderResultSet({ query, docSetHash, metaStore, minScore, secondarySortField, secondarySortOrder, loggingOn}) {
  const { docSetArray, startHashArray } = transformDocSetHashToArray({ query, docSetHash, metaStore, minScore, secondarySortField, loggingOn });
  const startArraySort = new Date();
  docSetArray.sort(function(a, b) {
    let compareObjects;
    // Determines sort value (-1, 0, 1) based on data type and sort order
    // stolen from nectar
    compareObjects = function(a, b, property, order) {
      let aprop, bprop, ref, ref1, ref2, ref3, sortOrder;
      sortOrder = order === 'desc' ? -1 : 1;
      aprop = ((ref = a[property]) != null ? ref.toLowerCase : void 0) != null ? (ref1 = a[property]) != null ? ref1.toLowerCase() : void 0 : a[property];
      bprop = ((ref2 = b[property]) != null ? ref2.toLowerCase : void 0) != null ? (ref3 = b[property]) != null ? ref3.toLowerCase() : void 0 : b[property];
      if (aprop === null && bprop !== null) {
        return 1;
      } else if (bprop === null) {
        return -1;
      } else {
        return sortOrder * (aprop > bprop ? 1 : (aprop < bprop ? -1 : 0));
      }
    };
    if (a.score !== b.score) {
      // sort on score only
      return compareObjects(a, b, 'score', 'desc');
    } else {
      if (secondarySortField === 'name') {
        // no custom sort, secondary sort on name
        return compareObjects(a, b, 'name', secondarySortOrder);
      } else {
        if (a.custSortField !== b.custSortField) {
          // custom secondary sort
          return compareObjects(a, b, 'custSortField', secondarySortOrder);
        } else {
          // ternary sort on name
          return compareObjects(a, b, 'name', 'asc');
        }
      }
    }
  });

  return { orderedResults: docSetArray, startHashArray, startArraySort };
};
