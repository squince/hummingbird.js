import Tokenizer from "../src/tokenizer.mjs";
import VariantStore from "../src/variant_store.mjs";
import assert from "assert";

describe('Hummingbird Variant Store', function () {
  let vStore, tokenizer;
  const startOfStringIndicator = "\u0002";
  const testVariants = {'steve': ['steven', 'stephen', 'stefan']};
  const doc1 = {id:'123', name: 'steve'};
  const doc2 = {id:'456', name: 'stephen'};

  before(function () {
    tokenizer = new Tokenizer({min: 3});
    vStore = new VariantStore(testVariants);
  });

  describe('loading nicknames into the variant store', function () {
    it('should enable nickname ngram tokens to be used to find documents', function () {
      const doc1Tokens = [startOfStringIndicator.concat('st'),'ste','tev','eve'];
      console.log('TEST_NAME', doc1.name);
      console.log('TEST_TOKENS', doc1Tokens);
      const d1_vTokens = vStore.getVariantTokens({name: doc1.name, tokenizer, tokens: doc1Tokens});
      assert.deepEqual(d1_vTokens, ['ven','tep','eph','phe','hen','tef','efa','fan']);
    });

    it('should not return a document containing one of the nicknames when that nickname has no explicit variants', function () {
      const doc2Tokens = [startOfStringIndicator.concat('st'),'ste','tep','eph','phe','hen'];
      const d2_vTokens = vStore.getVariantTokens({name: doc2.name, tokenizer, tokens: doc2Tokens});
      assert.deepEqual(d2_vTokens, []);
    });

    it('should serialize the normalized nicknames using toJSON method', function () {
      const normalizedVariantNames = testVariants['steve'].map( (name) => startOfStringIndicator.concat(name));
      const variants = {};
      variants[startOfStringIndicator.concat('steve')] = normalizedVariantNames;

      assert.deepEqual(vStore.toJSON(), { variants });
    });
  });
});
