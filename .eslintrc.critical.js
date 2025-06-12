// ESLint configuration that only enforces critical rules
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "react-hooks"
  ],
  "rules": {
    // Only flag truly critical errors
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-undef": "error",
    "no-const-assign": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "off",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "off",
    "no-fallthrough": "off",
    "no-func-assign": "error",
    "no-import-assign": "error",
    "no-obj-calls": "error",
    "no-prototype-builtins": "off",
    "no-unsafe-negation": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
    
    // React specific critical rules
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "off",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    
    // TypeScript specific critical rules
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-var-requires": "off",
    
    // React hooks - critical only
    "react-hooks/rules-of-hooks": "error", // Only critical hook issues
    "react-hooks/exhaustive-deps": "off"   // Turn off dependency warnings
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
