/* MetaStore
* Maps each id from the TokenStore to its stored, _untokenized_ fields in the MetaStore
*/

export default class MetaStore {
  constructor() {
    this.root = {};
  }

  // .load
  // Loads a previously serialized MetaStore
  load(serializedData) {
    this.root = serializedData.root;
  }

  // .has
  // Checks for this id in the MetaStore
  has(docId) {
    if (docId && docId in this.root) return true;
    return false;
  }

  // .add
  // Adds a hash of name-value pairs to the MetaStore
  add(doc) {
    if (doc && !this.has(doc.id)) {
      this.root[doc.id] = doc;
    }
  }

  // .get
  // Retrieve the name-value pairs associated with this id
  get(docId) {
    return this.root[docId] || null;
  }

  // .remove
  // Remove the name-value pairs associated with this id
  remove(docId) {
    if (this.has(docId)) delete this.root[docId]
  }
};
