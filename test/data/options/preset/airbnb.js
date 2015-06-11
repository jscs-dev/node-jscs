// requireParenthesesAroundIIFE
(function(window) {
  // validateIndentation: 2
  'use strict';

  // requirePaddingNewLinesBeforeLineComments
  // requireCurlyBraces
  // requireSpaceBeforeBlockStatements
  do {
    // disallowSpacesInsideParentheses
    console.log('foo');
  } while (true);

  // "disallowMultipleVarDecl": true
  // requireCommaBeforeLineBreak
  // requirePaddingNewLinesAfterBlocks
  var x = 1;

  // requireSpacesInConditionalExpression
  var y = x ? x : null;

  // requireTrailingComma
  var z = [
    1,
  ];

  // disallowSpacesInsideArrayBrackets
  // requireTrailingComma - { "ignoreSingleLine": true },
  var z = [1];

  // requireSpaceAfterKeywords
  if (1) console.log('foo');

  // requireBlocksOnNewline
  // disallowKeywordsOnNewLine: ["else"]
  if (1) {
    console.log('bar');
  } else {
    console.log('foobar');
    console.log('bar');

    // disallowSpaceAfterPrefixUnaryOperators
    ++x;

    // disallowSpaceBeforePostfixUnaryOperators
    x++;

    // requireSpaceBeforeBinaryOperators
    // requireSpaceAfterBinaryOperators
    z[0] = x + y;
  }

  // disallowSpacesInFunctionDeclaration
  function foo() {
    var api = {
      // disallowQuotedKeysInObjects
      // disallowSpaceAfterObjectKeys
      foo: function() {
        // safeContextKeyword
        var _this = this;

        // disallowDanglingUnderscores: false
        // validateQuoteMarks: ''
        var _priv = 'yo';

        // disallowEmptyBlocks
        return function() {
          // requireSpaceBetweenArguments
          console.log('bar', 'foo');
        };
      },

      // requireCamelCaseOrUpperCaseIdentifiers
      mySweetProp: true,
    };

    return api;
  }

  // requireCapitalizedConstructors
  function Bar() {}
})(window);
