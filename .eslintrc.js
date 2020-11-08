module.exports = {
  env: {
    browser: true,
    es6: true,
    amd: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 8,
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
  parser: "babel-eslint",
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": "error",
  },
};
