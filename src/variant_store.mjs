import { normalizeString } from "./utils.mjs";

/** VariantStore
* A collection of objects and methods for working with names and their variants (i.e., nicknames)
*/
export default class VariantStore {
  // this.variants = key is name, value is array of nicknames/variants
  constructor(variantsObj) {
    this.variants = {};

    if (variantsObj) {
      for (name in variantsObj) {
        const norm_name = normalizeString(name);
        this.variants[norm_name] = [];
        variantsObj[name].forEach(((variant, i, variants) => {
          const normVariant = normalizeString(variant);
          return this.variants[norm_name].push(normVariant);
        }), this);
      }
    }
  };

  /** .load
  * Loads a previously serialized variant store
  */
  load(serializedData) {
    const store = new (this)();
    if (serializedData.hasOwnProperty('variants')) store.variants = serializedData.variants;
    return store;
  };

  /** toJSON
  * Returns a representation of the variant store ready for serialization.
  */
  toJSON() {
    return { variants: this.variants };
  };

  /** getVariantTokens
  * Returns tokens associated with variants of the provided name
  * that would not otherwise be associated with the provided name.
  */
  // TODO: change function signature to take named properties of an object
  getVariantTokens(name, tokenizer, tokens) {
    var matched_variants, norm_name, variant_tokens;
    matched_variants = [];
    variant_tokens = {};
    norm_name = normalizeString(name);
    if ((norm_name == null) || norm_name === undefined) {
      return variant_tokens;
    }
    // first check to see if the norm_name has variants
    if (this.variants.hasOwnProperty(norm_name)) {
      this.variants[norm_name].forEach((function(variant, i, variants) {
        var k, len, ref, results, token;
        ref = tokenizer.tokenize(variant);
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {
          token = ref[k];
          if (tokens.indexOf(token) === -1) {
            results.push(variant_tokens[token] = null);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }), this);
    }
    // then split the full name on word boundaries and check each name part
    if (norm_name !== norm_name.split(/\s+/)[0]) {
      norm_name.split(/\s+/).forEach((function(name_part, j, names) {
        // check each name word for any nicknames/variants
        if (this.variants.hasOwnProperty(name_part)) {
          return this.variants[name_part].forEach((function(variant, i, variants) {
            var k, len, ref, results, token;
            ref = tokenizer.tokenize(variant);
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              token = ref[k];
              if (tokens.indexOf(token) === -1) {
                results.push(variant_tokens[token] = null);
              } else {
                results.push(void 0);
              }
            }
            return results;
          }), this);
        }
      }), this);
    }
    return Object.keys(variant_tokens);
  };
};
