module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "header",
    "@typescript-eslint"
  ],
  "rules": {
    // 스타일
    "array-bracket-newline": [ "error", "consistent" ],
    "array-bracket-spacing": [ "error", "always", {
      "arraysInArrays": false,
      "objectsInArrays": false
    }],
    "arrow-spacing": 2,
    "block-spacing": [ "error", "always" ],
    "camelcase": 2,
    "comma-dangle": [ "error", "never" ],
    "comma-spacing": 2,
    "comma-style": 2,
    "computed-property-spacing": 2,
    "eol-last": 2,
    "func-call-spacing": 2,
    "function-call-argument-newline": [ "error", "consistent" ],
    "function-paren-newline": [ "error", "consistent" ],
    "generator-star-spacing": [ "error", {
      "before": true,
      "after": false
    }],
    "implicit-arrow-linebreak": 2,
    "indent": [ "error", 2, {
      "SwitchCase": 1
    }],
    "jsx-quotes": 2,
    "key-spacing": [ "error", {
      "beforeColon": false,
      "afterColon": true,
      "mode": "strict",
      "align": "colon"
    }],
    "keyword-spacing": [ "error", {
      "before": false,
      "after": false,
      "overrides": {
        "const": { "before": true, "after": true },
        "from": { "before": true, "after": true },
        "import": { "before": true, "after": true },
        "let": { "before": true, "after": true },
        "return": { "before": true, "after": true }
      }
    }],
    "linebreak-style": 2,
    "max-len": [ "warn", 120 ],
    "multiline-comment-style": 2,
    "new-parens": 2,
    "no-lonely-if": 2,
    "no-multiple-empty-lines": [ "error", {
      "max": 1
    }],
    "no-trailing-spaces": 2,
    "no-useless-constructor": 1,
    "no-var": 2,
    "no-whitespace-before-property": 2,
    "nonblock-statement-body-position": 2,
    "object-curly-newline": 2,
    "object-curly-spacing": [ "error", "always", {
      "arraysInObjects": false,
      "objectsInObjects": false
    }],
    "object-shorthand": 2,
    "operator-linebreak": [ "error", "before" ],
    "padded-blocks": [ "error", "never" ],
    "padding-line-between-statements": [ "error", {
      "blankLine": "always",
      "prev": "*",
      "next": "return"
    }, {
      "blankLine": "always",
      "prev": [ "const", "let", "var" ],
      "next": "*"
    }, {
      "blankLine": "any",
      "prev": [ "const", "let", "var" ],
      "next": [ "const", "let", "var" ]
    }],
    "semi": [ "error", "always" ],
    "semi-spacing": 2,
    "space-before-blocks": [ "error", "never" ],
    "space-before-function-paren": [ "error", "never" ],
    "space-in-parens": [ "error", "never" ],
    "space-infix-ops": 2,
    "space-unary-ops": 2,
    "switch-colon-spacing": 2,
    "template-curly-spacing": 2,
    "sort-imports": [ "error", {
      "ignoreDeclarationSort": true
    }],

    // 기본
    "class-methods-use-this": 1,
    "consistent-return": 2,
    "curly": [ "error", "multi-line" ],
    "default-case": 2,
    "dot-location": [ "error", "property" ],
    "eqeqeq": 2,
    "grouped-accessor-pairs": 2,
    "linebreak-style": [ "error", "unix" ],
    "no-caller": 2,
    "no-else-return": 2,
    "no-empty-function": 2,
    "no-eq-null": 2,
    "no-eval": 2,
    "no-floating-decimal": 2,
    "no-implicit-coercion": 2,
    "no-implicit-globals": 2,
    "no-implied-eval": 2,
    "no-lone-blocks": 2,
    "no-multi-spaces": 2,
    "no-new": 2,
    "no-new-func": 2,
    "no-new-wrappers": 2,
    "no-param-reassign": 2,
    "no-path-concat": 2,
    "no-return-assign": 2,
    "no-shadow": 2,
    "no-unmodified-loop-condition": 2,
    "no-unused-expressions": 2,
    "no-useless-concat": 2,
    "no-useless-return": 2,
    "prefer-promise-reject-errors": 2,
    "require-await": 2,
    "yoda": 2,

    // 플러그인
    "header/header": [ "error", "data/header.js" ],
    "@typescript-eslint/no-this-alias": 2,
    "@typescript-eslint/no-magic-numbers": [ "error", {
      "ignore": [ -1, 0, 1, 2 ],
      "ignoreArrayIndexes": true,
      "ignoreEnums": true,
      "ignoreReadonlyClassProperties": true
    }],
    "@typescript-eslint/no-unused-vars": 1,
    "@typescript-eslint/type-annotation-spacing": [ "error", {
      "before": false,
      "after": false
    }],
    
    // 비활성화
    "no-cond-assign": 0,
    "no-control-regex": 0,
    "no-invalid-this": 0,
    "no-magic-numbers": 0,
    "no-unused-vars": 0,

    // 플러그인 비활성화
    "@typescript-eslint/brace-style": [ "error", "1tbs" ],
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-use-before-define": 0
  }
};
