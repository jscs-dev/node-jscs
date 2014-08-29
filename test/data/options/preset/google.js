// includes portions of yo cli (c) Google
var opts = nopt({
  // requireOperatorBeforeLineBreak
  help: Boolean,
  version: Boolean
});

// disallowMultipleLineBreaks
// disallowMultipleVarDecl
var insight = new Insight({
  // validateIndentation: 2
  // validateQuoteMarks: '',
  trackingCode: 'UA-31537568-1',
  // requireCamelCaseOrUpperCaseIdentifiers
  packageName: pkg.name,
  packageVersion: pkg.version
});

// requireSpacesInFunctionExpression: before curly brace
var functionExpression = function fooFn() {};
// disallowSpacesInAnonymousFunctionExpression: before round brace
var anonymousFunction = function() {};

// requireCurlyBraces
// requireSpaceAfterKeywords
// requireSpaceBeforeBinaryOperators
// requireSpaceAfterBinaryOperators
// requireSpacesInConditionalExpression
if (opts.insight === false) {
  insight.config.set('optOut', true);
} else if (opts.insight) {
  insight.config.set('optOut', false);
}

function rootCheck() {
  // requireSpaceBeforeBlockStatements
  // disallowSpaceAfterPrefixUnaryOperators
  if (!isRoot() && process.setuid) {
    try {
      // Try to force yo to run on a safe uid
      process.setuid(501);
    } catch (err) {}
  }
}

// disallowSpacesInsideArrayBrackets
var arr = [1, 2, 3];
// disallowSpacesInsideObjectBrackets
var obj = {a: 1, b: 2, c: 3};
// disallowSpacesInsideParentheses
console.log('string');
