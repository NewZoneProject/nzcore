import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn", // Warn about any usage
      "@typescript-eslint/no-non-null-assertion": "warn", // Warn about ! operator
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-ignore": "allow-with-description",
        "ts-expect-error": "allow-with-description"
      }],

      // General rules
      "no-constant-condition": "off", // Allow while(true)
      "no-unused-vars": "off", // Use TypeScript version
    },
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
