import { normalizeString } from "./utils.mjs";

/** Tokenizer
* A flexible ngram tokenizer that can index a string using a range of lengths
* for substrings suitable for autocomplete indexing and fuzzy name matching
*/

export default class Tokenizer {
  // TODO: update usage of Tokenizer to take a single object with min/max props
  constructor({min, max}) {
    if (min && typeof min === 'number' && min > 0) this.min = min;
    else this.min = 3;

    if (max && typeof max === 'number' && max > min) this.max = max;
    else this.max = min;
  };

  /** tokenize
  * Splits a string into ngram tokens
  * To boost prefix matches, a start character \u0002 is prepended to the string
  * and used in the ngrams. This causes a sequence of characters at the start of both
  * a search query and a sought term to more tightly match than a similar series of
  * characters elsewhere in sought terms.
  */
  tokenize(name) {
    const norm_name = normalizeString(name);
    if (!norm_name) return [];

    const alltokens = {};
    let n = this.min;
    while (n <= this.max) {
      if (norm_name.length <= n) {
        alltokens[norm_name] = null;
      } else {
        let i = 0;
        while (i <= norm_name.length - n) {
          alltokens[norm_name.slice(i, i + n)] = null;
          i++;
        }
      }
      n++;
    }
    return Object.keys(alltokens);
  };
};
