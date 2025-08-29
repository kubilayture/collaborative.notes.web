import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react";
import reactDom from "eslint-plugin-react-dom";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import eslint from "@eslint/js";

export default tseslint.config(
  {
    ignores: ["eslint.config.js"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  [
    globalIgnores(["dist"]),
    {
      files: ["**/*.{ts,tsx}"],
      extends: [
        ...tseslint.configs.recommendedTypeChecked,
        reactHooks.configs["recommended-latest"],
        reactRefresh.configs.vite,
        reactX.configs["recommended-typescript"],
        reactDom.configs.recommended,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          project: ["./tsconfig.node.json", "./tsconfig.app.json"],
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
      },
    },
  ]
);
