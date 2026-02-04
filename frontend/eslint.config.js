import prettierPlugin from "eslint-plugin-prettier";
import solid from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const noUnusedVarsRule = [
  "warn",
  {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_",
  },
];

const customJsRules = {
  "no-duplicate-imports": 0,
  "import/no-duplicates": 2,
  "import/named": 0,
  "import/no-unresolved": 0,
  // "prettier/prettier": [
  //   "error",
  //   {
  //     tabWidth: 2,
  //     printWidth: 120,
  //     singleQuote: true,
  //     trailingComma: "all",
  //     endOfLine: "auto",
  //   },
  // ],
  "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
  "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  "arrow-body-style": ["error", "as-needed"],
  "import/extensions": [
    "error",
    "never",
    { ts: "never", tsx: "never", json: "always", css: "always" },
  ],
  "no-unused-vars": noUnusedVarsRule,
};

const customTsRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": noUnusedVarsRule,
};

const configTemplate = {
  defaultSettings: {},
  defaultPlugins: {
    prettier: prettierPlugin,
  },
  jsRules: {
    ...eslint.configs.recommended.rules,
    ...customJsRules,
  },
  tsRules: {
    ...eslint.configs.recommended.rules,
    ...tsPlugin.configs.recommended.rules,
    ...customJsRules,
    ...customTsRules,
  },
  defaultLanguageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
};

export default [
  importPlugin.flatConfigs.recommended,
  solid,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      ...configTemplate.defaultLanguageOptions,
      parser: tsParser,
    },
    plugins: {
      ...configTemplate.defaultPlugins,
      "@typescript-eslint": tsPlugin,
    },
    rules: configTemplate.tsRules,
    settings: configTemplate.defaultSettings,
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: configTemplate.defaultLanguageOptions,
    plugins: configTemplate.defaultPlugins,
    rules: configTemplate.jsRules,
    settings: configTemplate.defaultSettings,
  },
  {
    ignores: [
      "**/__tests__/*.{j,t}s?(x)",
      "**/tests/unit/**/*.spec.{j,t}s?(x)",
      "dist/**",
      "target/**",
    ],
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
