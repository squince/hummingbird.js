import hum from "../src/hummingbird.mjs";
import assert from "assert";

describe("Hummingbird Tokenizer", function () {
  let bigramTokenizer, trigramTokenizer, rangeGramTokenizer;
  const startOfStringIndicator = "\u0002";
  const simpleTxt = "simple string";
  const mixedCaseTxt = "AlEiN";
  const punctuationTxt = "!@#$%";

  before(function () {
    bigramTokenizer = new hum.tokenizer(2);
    trigramTokenizer = new hum.tokenizer(3);
    rangeGramTokenizer = new hum.tokenizer(2,4);
  });

  describe("splitting a simple string into bi-grams", function () {
    it("should produce an array of 2 character strings", function () {
      const tokens = bigramTokenizer.tokenize(simpleTxt);
      assert.deepEqual(tokens, [
        startOfStringIndicator.concat("s"),
        "si",
        "im",
        "mp",
        "pl",
        "le",
        "e ",
        " s",
        "st",
        "tr",
        "ri",
        "in",
        "ng"
      ]);
    });
  });

  describe("splitting a simple string into tri-grams", function() {
    it("should produce an array of 3 character strings", function () {
      const tokens = trigramTokenizer.tokenize(simpleTxt);
      assert.deepEqual(tokens, [
        startOfStringIndicator.concat("si"),
        "sim",
        "imp",
        "mpl",
        "ple",
        "le ",
        "e s",
        " st",
        "str",
        "tri",
        "rin",
        "ing"
      ]);
    });
  });

  describe("splitting a mixed case string into tri-grams", function() {
    it("should produce an array of lower-cased 3 character strings", function () {
      const tokens = trigramTokenizer.tokenize(mixedCaseTxt);
      assert.deepEqual(tokens, [
        startOfStringIndicator.concat("al"),
        "ale",
        "lei",
        "ein"
      ]);
    });
  });

  describe("splitting a string of punctuation and symbols", function () {
    it("should not exclude any 'special' characters", function () {
      const tokens = trigramTokenizer.tokenize(punctuationTxt);
      assert.deepEqual(tokens, [
        startOfStringIndicator.concat("!@"),
        "!@#",
        "@#$",
        "#$%"
      ]);
    });
  });

  describe("splitting a string into multi-grams", function() {
    it("should produce an array of multilength strings", function () {
      const tokens = rangeGramTokenizer.tokenize(simpleTxt);
      assert.deepEqual(tokens, [
        startOfStringIndicator.concat("s"),
        "si",
        "im",
        "mp",
        "pl",
        "le",
        "e ",
        " s",
        "st",
        "tr",
        "ri",
        "in",
        "ng",
        startOfStringIndicator.concat("si"),
        "sim",
        "imp",
        "mpl",
        "ple",
        "le ",
        "e s",
        " st",
        "str",
        "tri",
        "rin",
        "ing",
        startOfStringIndicator.concat("sim"),
        "simp",
        "impl",
        "mple",
        "ple ",
        "le s",
        "e st",
        " str",
        "stri",
        "trin",
        "ring"
      ]);
    });
  });
});
