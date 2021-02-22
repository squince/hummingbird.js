import * as Utils from "./utils.mjs";

/* VariantStore
* A collection of objects and methods for working with names and their variants (i.e., nicknames)
* The class member variants a hash whose key that is a normalized name and whose value is an array of nicknames or aliases
* example: {'steve': ['steven', 'stephen', 'stefan']}
*/
export default class VariantStore {
  constructor(variantsObj) {
    this.variants = {};

    if (variantsObj) {
      for (const name in variantsObj) {
        const norm_name = Utils.normalizeString(name);
        this.variants[norm_name] = [];
        for (const variant of variantsObj[name]) {
          const normVariant = Utils.normalizeString(variant);
          this.variants[norm_name].push(normVariant);
        };
      }
    }
  };

  /* .load
  * Loads a previously serialized variant store
  */
  load(serializedData) {
    const store = new (this)();
    if (serializedData.hasOwnProperty('variants')) store.variants = serializedData.variants;
    return store;
  };

  /* toJSON
  * Returns a representation of the variant store ready for serialization.
  */
  toJSON() {
    return { variants: this.variants };
  };

  /* getVariantTokens
  * Returns an array of distinct tokens associated with variants of the provided name
  * These tokens would not otherwise be associated with the provided name.
  */
  getVariantTokens({name, tokenizer, tokens}) {
    const variant_tokens = new Set();
    const norm_name = Utils.normalizeString(name);

    // short circuit
    if (!norm_name) return Array.from(variant_tokens);

    // first check to see if the norm_name has variants
    if (this.variants.hasOwnProperty(norm_name)) {
      for (const variant of this.variants[norm_name]) {
        for (const token of tokenizer.tokenize(variant)) {
          if (!tokens.includes(token)) variant_tokens.add(token);
        };
      };
    };

    // then split the full name on word boundaries and check each name part
    // check each name word for any nicknames/variants
    if (norm_name !== norm_name.split(/\s+/)[0]) {
      for (const name_part of norm_name.split(/\s+/)) {
        if (this.variants.hasOwnProperty(name_part)) {
          for (const variant of this.variants[name_part]) {
            for (const token of tokenizer.tokenize(variant)) {
              if (!tokens.includes(token)) variant_tokens.add(token);
            };
          };
        };
      };
    };
    return Array.from(variant_tokens);
  };
};
