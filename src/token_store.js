import { error } from "./utils.js";

/** TokenStore
* The inverted index that maps each token in the corpus to all the names
* that contain said token
*/

export default class TokenStore {
  constructor() {
    this.root = {};
  };

  // .load
  // Loads a previously serialized token store
  static load(serializedData) {
    const store = new this;
    store.root = serializedData.root;
    return store;
  }

  // .toJSON
  // Returns a representation of the token store ready for serialization.
  get toJSON() {
    return {
      root: this.root
    };
  }

  // .add
  // Adds to the store a new token and document 'id', and distinguishes between variant doc matches and normal name matches.
  add(token, isVariant, docId) {
    if(!token) throw error('token must be supplied and is missing');
    if(!docId) throw error('docId must be supplied and is missing');

    if (!this.root[token]) this.root[token] = {};

    if (!isVariant) {
      // name token matches for this document
      if (!this.root[token]['n']) base1['n'] = {};
      this.root[token]['n'][docId] = 1;
    } else {
      // variant-only token matches for this document
      if (((ref = this.root[token]['n']) != null ? ref[docId] : void 0) == null) {
        if ((base2 = this.root[token])['v'] == null) {
          base2['v'] = {};
        }
        this.root[token]['v'][docId] = 1;
      }
    }
  }

  // .has
  // Checks whether this key is contained within this hummingbird.TokenStore.
  has(token) {
    if (!token) {
      return false;
    }
    if (token in this.root) {
      return true;
    } else {
      return false;
    }
  }

  // .get
  // Retrieve the documents for the given token
  get(token, isVariant) {
    var ref, ref1, ref2, ref3;
    if (isVariant) {
      return (ref = (ref1 = this.root[token]) != null ? ref1['v'] : void 0) != null ? ref : {};
    } else {
      return (ref2 = (ref3 = this.root[token]) != null ? ref3['n'] : void 0) != null ? ref2 : {};
    }
  }

  // .count
  // Number of documents associated with the given token
  count(token) {
    var count, ref, ref1;
    if (!token || !this.root[token]) {
      return 0;
    }
    count = 0;
    count += Object.keys((ref = this.root[token]['n']) != null ? ref : {}).length;
    count += Object.keys((ref1 = this.root[token]['v']) != null ? ref1 : {}).length;
    return count;
  }

  // .remove
  // Remove the document identified by docRef from each token in the store where it appears.
  remove(docRef, tokens = Object.keys(this.root)) {
    return tokens.forEach((function(token) {
      var ref, ref1;
      if (((ref = this.root[token]['n']) != null ? ref[docRef] : void 0) != null) {
        delete this.root[token]['n'][docRef];
        if (Object.keys(this.root[token]['n']).length === 0) {
          delete this.root[token]['n'];
        }
      }
      if (((ref1 = this.root[token]['v']) != null ? ref1[docRef] : void 0) != null) {
        delete this.root[token]['n'][docRef];
        if (Object.keys(this.root[token]['v']).length === 0) {
          delete this.root[token]['v'];
        }
      }
      if (Object.keys(this.root[token]).length === 0) {
        delete this.root[token];
      }
    }), this);
  }
};
