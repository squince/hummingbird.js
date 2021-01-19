import { error } from "./utils.mjs";

/** TokenStore
* The inverted index that maps each token in the corpus to all the names
* that contain said token
*/

export default class TokenStore {
  constructor() {
    this.root = {};
  };

  /** .load
  * Loads a previously serialized token store
  */
  static load(serializedData) {
    const store = new this;
    store.root = serializedData.root;
    return store;
  }

  /** .toJSON
  * Returns a representation of the token store ready for serialization.
  */
  get toJSON() {
    return {
      root: this.root
    };
  }

  /** .add
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
  }

  /** .has
  * Checks whether this key is contained within this hummingbird.TokenStore.
  */
  has(token) {
    return token ? token in this.root : false;
  }

  /** .get
  * Retrieve the documents for the given token
  */
  get(token, isVariant) {
    if (isVariant) {
      return this.root[token]?.v || {};
    } else {
      return this.root[token]?.n || {};
    }
  }

  /** .count
  * Number of documents associated with the given token
  */
  count(token) {
    if (!token || !this.root[token]) return 0;

    let count = 0;
    count += Object.keys(this.root[token]?.n || {}).length;
    count += Object.keys(this.root[token]?.v || {}).length;
    return count;
  }

  /** .remove
  * Remove the document identified by docRef from each token in the provided array of tokens (optimal).
  * If no array is provided, traverse all tokens in the store and remove wherever the document appears.
  */
  remove(docRef, tokens = Object.keys(this.root)) {
    return tokens.forEach((function(token) {
      if (this.root[token]?.n?.[docRef]) {
        delete this.root[token].n[docRef];
        if (Object.keys(this.root[token].n).length === 0) {
          // remove the named-token association if no other documents are attached
          delete this.root[token].n;
        }
      }
      if (this.root[token]?.v?.[docRef]) {
        delete this.root[token].v[docRef];
        if (Object.keys(this.root[token].v).length === 0) {
          // remove the variant-token association if no other documents are attached
          delete this.root[token].v;
        }
      }
      if (Object.keys(this.root[token]).length === 0) {
        // remove the token node altogether if neither variant nor name tokens remain
        delete this.root[token];
      }
    }), this);
  }
};
