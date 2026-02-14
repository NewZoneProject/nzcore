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
      "@typescript-eslint/no-explicit-any": "off", // Разрешаем any
      "@typescript-eslint/no-non-null-assertion": "off", // Разрешаем ! оператор
      "@typescript-eslint/ban-ts-comment": "off", // Разрешаем @ts-ignore
      
      // General rules
      "no-constant-condition": "off", // Разрешаем while(true)
      "no-unused-vars": "off", // Отключаем в пользу TypeScript версии
    },
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
