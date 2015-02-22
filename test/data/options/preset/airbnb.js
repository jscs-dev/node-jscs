// requireParenthesesAroundIIFE
(function(window) {
  // validateIndentation: 2
  'use strict';

  // requireCurlyBraces
  // requireSpaceBeforeBlockStatements
  do {
    // disallowSpacesInsideParentheses
    console.log('foo');
  } while (true);

  // "disallowMultipleVarDecl": true
  // requireCommaBeforeLineBreak
  var x = 1;
  // requireSpacesInConditionalExpression
  var y = x ? x : null;
      // disallowSpacesInsideArrayBrackets
  var z = [1];

  // requireSpaceAfterKeywords
  if (1) console.log('foo');
  // requireBlocksOnNewline
  else {
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
        }
      },

      // requireCamelCaseOrUpperCaseIdentifiers
      mySweetProp: true
    };

    return api;
  }

  // requireCapitalizedConstructors
  function Bar() {}
})(window);
