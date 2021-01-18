module.exports = {
  env: {
    browser: true,
    es6: true,
    es2017: true,
    es2020: true,
    amd: true,
    node: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 11,
    ecmaFeatures: {
      experimentalDecorators: true,
      experimentalObjectRestSpread: true,
      modules: true,
      arrowFunctions: true,
      classes: true,
      spread: true,
    },
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  parser: "eslint",
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": "error",
  },
};
