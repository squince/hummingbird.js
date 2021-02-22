import { error } from "./utils.mjs";

/* TokenStore
* The inverted index that maps each token in the corpus to all the names
* that contain said token
*/

export default class TokenStore {
  constructor() {
    this.root = {};
  };

  /* .load
  * Loads a previously serialized token store
  */
  load(serializedData) {
    this.root = serializedData && serializedData.root ? serializedData.root : {};
  };

  /* .toJSON
  * Returns a representation of the token store ready for serialization.
  */
  toJSON() {
    return {
      root: this.root
    };
  };

  /* .add
  * Adds to the store a new token and document 'id', and distinguishes between variant doc matches and normal name matches.
  * TODO: consider changing object keys 'n' and 'v' to more human friendly values
  * TODO: then transform to compressed versions in .toJSON and .load methods
  */
  add(token, isVariant, docId) {
    if (!(token && docId)) throw error('token and docId must both be supplied');

    const storedToken = this.root[token] || {};

    if (isVariant) {
      // augment index with a variant-token
      // only when this token is not also a name-token for this document
      // do not store the same token as both a name-token and variant-token
      if (!storedToken.n || !storedToken.n[docId]) {
        if (!storedToken.v) storedToken.v = {};
        storedToken.v[docId] = 1;
      }
    } else {
      // associate name-token match for this document
      if (!storedToken.n) storedToken.n = {};
      storedToken.n[docId] = 1;
    }
    this.root[token] = storedToken;
  };

  /* .has
  * Checks whether this key is contained within this hummingbird.TokenStore.
  */
  has(token) {
    return token ? token in this.root : false;
  };

  /* .get
  * Retrieve the documents for the given token
  */
  get(token, isVariant) {
    const tokenType = isVariant ? 'v' : 'n';
    let docs = {};

    if (this.root[token] && this.root[token][tokenType])
      docs = this.root[token][tokenType];

    return docs;
  };

  /* .count
  * Number of documents associated with the given token
  */
  count(token) {
    if (!token || !this.root[token]) return 0;

    let count = 0;
    if (this.root[token]) {
      count += this.root[token].n ? Object.keys(this.root[token].n).length : 0;
      count += this.root[token].v ? Object.keys(this.root[token].v).length : 0;
    }
    return count;
  };

  /* .remove
  * Remove the document identified by docRef from each token in the provided array of tokens (optimal).
  * If no array is provided, traverse all tokens in the store and remove wherever the document appears.
  */
  remove(docRef, tokens = Object.keys(this.root)) {
    return tokens.forEach((function(token) {
      const storedToken = this.root[token] || {};
      if (storedToken) {
        if (storedToken.n && storedToken.n[docRef]) {
          delete storedToken.n[docRef];
          if (Object.keys(storedToken.n).length === 0) {
            // remove the named-token association if no other documents are attached
            delete storedToken.n;
          }
        }
        if (storedToken.v && storedToken.v[docRef]) {
          delete storedToken.v[docRef];
          if (Object.keys(storedToken.v).length === 0) {
            // remove the variant-token association if no other documents are attached
            delete storedToken.v;
          }
        }
        if (Object.keys(storedToken).length === 0) {
          // remove the token node altogether if neither variant nor name tokens remain
          delete this.root[token];
        }
      }
    }), this);
  };
};
