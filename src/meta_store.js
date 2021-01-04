// MetaStore
// Maps each id from the TokenStore to its stored, _untokenized_ fields in the MetaStore

export default class MetaStore {
  constructor() {
    this.root = {};
  }

  // .load
  // Loads a previously serialized MetaStore
  static load(serializedData) {
    var store;
    store = new (this)();
    store.root = serializedData.root;
    return store;
  }

  // toJSON
  // Returns a JSON representation of the MetaStore
  // TODO: shouldn't this return a JSON string?
  // TODO: why not just return `this` here?
  toJSON() {
    return {
      root: this.root
    };
  }

  // add
  // Adds a hash of name-value pairs to the MetaStore
  add(doc) {
    if (!(this.has(doc['id']) || doc === undefined)) {
      this.root[doc['id']] = doc;
    }
  }

  // has
  // Checks for this id in the MetaStore
  has(docId) {
    if (docId && docId in this.root) return true;
    return false;
  }

  // get
  // Retrieve the name-value pairs associated with this id
  get(docId) {
    return this.root[docId] || null;
  }

  // remove
  // Remove the name-value pairs associated with this id
  remove(docId) {
    if (this.has(docId)) delete this.root[docId]
  }
};
