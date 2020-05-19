module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["prettier", "plugin:prettier/recommended", "eslint:recommended", "plugin:@typescript-eslint/eslint-recommended"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": "off",
    "no-undef": "off",
    quotes: [2, "double", { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ["warn", "never"],
    "prettier/prettier": "warn"
  },
};

