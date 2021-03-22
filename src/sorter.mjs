import * as Utils from "./utils.mjs";

function transformDocSetHashToArray({ query, docSetHash, metaStore, minScore, secondarySortField, loggingOn }) {
  const startHashArray = new Date();
  const docSetArray = [];
  if (loggingOn) Utils.logTiming('hash to sorted array\n');
  for (let key in docSetHash) {
    if (docSetHash[key] >= minScore) {
      // exact match?
      const exactMatch = Utils.normalizeString(query) === Utils.normalizeString(metaStore.get(key).name) ? true : false;
      const score = exactMatch ? docSetHash[key] + 0.1 : docSetHash[key];
      const name = metaStore.get(key).name;
      const custSortField = metaStore.get(key)[secondarySortField];

      if (secondarySortField === 'name') docSetArray.push({ id: key, score, name });
      else docSetArray.push({ id: key, score, name, custSortField });
    }
  }
  return { docSetArray, startHashArray };
};

// Determines sort value (-1, 0, 1) based on data type and sort order
function compareObjects(a, b, property, order) {
  const sortOrder = order === 'desc' ? -1 : 1;
  const aprop = a[property]?.toLowerCase ? a[property].toLowerCase() : a[property];
  const bprop = b[property]?.toLowerCase ? b[property].toLowerCase() : b[property];

  if (!aprop && bprop) return 1;
  if (!bprop) return -1;
  if (aprop > bprop) return sortOrder;
  if (aprop < bprop) return sortOrder * -1;
  return 0;
};

// filter out results below the minScore
// boost exact matches - consciously does not convert diacritics, but uncertain whether that's best
export function orderResultSet({ query, docSetHash, metaStore, minScore, secondarySortField, secondarySortOrder, loggingOn}) {
  const { docSetArray, startHashArray } = transformDocSetHashToArray({ query, docSetHash, metaStore, minScore, secondarySortField, loggingOn });
  const startArraySort = new Date();
  docSetArray.sort(function(a, b) {
    // sort on score only
    if (a.score !== b.score) return compareObjects(a, b, 'score', 'desc');

    // no custom sort, secondary sort on name
    if (secondarySortField === 'name') return compareObjects(a, b, 'name', secondarySortOrder);

    // custom secondary sort
    if (a.custSortField !== b.custSortField) return compareObjects(a, b, 'custSortField', secondarySortOrder);

    // ternary sort on name
    return compareObjects(a, b, 'name', 'asc');
  });

  return { orderedResults: docSetArray, startHashArray, startArraySort };
};
