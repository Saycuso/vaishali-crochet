module.exports = {
  "env": {
    "es6": true,
    "node": true,
  },
  "parserOptions": {
    "ecmaVersion": 2018,
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "rules": {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],

    // FIX: Broke the long rule into multiple lines
    "max-len": ["error", {
      "code": 120,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
    }],

    // FIX: Disables the camelcase error for Razorpay keys
    "camelcase": "off",
    "require-jsdoc": "off", // 🟢 removes JSDoc warning
    "eol-last": "off", // 🟢 removes newline-at-end warning
  },
  "overrides": [
    {
      "files": ["**/*.spec.*"],
      "env": {
        "mocha": true,
      },
      "rules": {},
    },
  ],
  "globals": {},
};
