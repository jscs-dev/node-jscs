# node-jscs [![Build Status](https://travis-ci.org/mdevils/node-jscs.png?branch=master)](https://travis-ci.org/mdevils/node-jscs)


JSCS — JavaScript Code Style.

`jscs` is a code style checker. `jscs` can check cases, which are not implemeted in jshint,
but it does not duplicate `jshint` functionality, so you should use `jscs` and `jshint` together.

## Friendly packages

 * Grunt task: https://github.com/gustavohenke/grunt-jscs-checker
 * Gulp task: https://github.com/sindresorhus/gulp-jscs
 * Syntastic VIM Plugin: https://github.com/scrooloose/syntastic/blob/master/syntax_checkers/javascript/jscs.vim
 * SublimeText 3 Plugin: https://github.com/SublimeLinter/SublimeLinter-jscs/commits/master 

## Installation

`jscs` can be installed using `npm`:

```
npm install jscs
```

To run `jscs`, you can use the following command from the project root:

```
./node_modules/.bin/jscs path[ path[...]]
```

## Configuration

`jscs` is configured using [.jscs.json](.jscs.json) file, located in the project root.

### requireCurlyBraces

Requires curly braces after statements.

Type: `Array`

Values: Arrow of quoted keywords

JSHint: [`curly`](http://jshint.com/docs/options/#curly)

#### Example

```js
"requireCurlyBraces": [
    "if",
    "else",
    "for",
    "while",
    "do",
    "try",
    "catch",
    "case",
    "default"
]
```

##### Valid

```js
if (x) {
    x++;
}
```

##### Invalid

```js
if (x) x++;
```

### requireSpaceAfterKeywords

Requires space after keyword.

Type: `Array`

Values: Array of quoted keywords

#### Example

```js
"requireSpaceAfterKeywords": [
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "return",
    "try",
    "catch"
]
```

##### Valid

```js
return true;
```

##### Invalid

```js
if(x) {
    x++;
}
```

### disallowSpaceAfterKeywords

Disallows space after keyword.

Type: `Array`

Values: Array of quoted keywords

#### Example

```js
"disallowSpaceAfterKeywords": [
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "try",
    "catch"
]
```

##### Valid

```js
if(x > y) {
    y++;
}
```

### requireParenthesesAroundIIFE

Requires parentheses around immediately invoked function expressions.

Type: `Boolean`

Values: `true`

JSHint: [`immed`](http://www.jshint.com/docs/options/#immed)

#### Example

```js
"requireParenthesesAroundIIFE": true
```

##### Valid

```js
var a = (function(){ return 1; })();
var b = (function(){ return 2; }());
var c = (function(){ return 3; }).call(this, arg1);
var d = (function(){ return 3; }.call(this, arg1));
var e = (function(){ return d; }).apply(this, args);
var f = (function(){ return d; }.apply(this, args));
```

##### Invalid

```js
var a = function(){ return 1; }();
var c = function(){ return 3; }.call(this, arg1);
var d = function(){ return d; }.apply(this, args);
```

### requireSpacesInFunctionExpression

Requires space before `()` or `{}` in function declarations.

Type: `Object`

Values: `beforeOpeningRoundBrace` and `beforeOpeningCurlyBrace` as child properties. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function () {}
function a () {}
```

##### Invalid

```js
function() {}
function (){}
```


### disallowSpacesInFunctionExpression

Disallows space before `()` or `{}` in function declarations.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function(){}
function a(){}
```

##### Invalid

```js
function () {}
function a (){}
```


### disallowMultipleVarDecl

Disallows multiple `var` declaration (except for-loop).

Type: `Boolean`

Values: `true`

JSHint: [`onvar`](http://jshint.com/docs/options/#onevar)

#### Example

```js
"disallowMultipleVarDecl": true
```

##### Valid

```js
var x = 1,
    y = 2;
```

##### Invalid

```js
var x = 1;
var y = 2;
```

### requireMultipleVarDecl

Requires multiple `var` declaration.

Type: `Boolean`

Values: `true`

JSHint: [`onvar`](http://jshint.com/docs/options/#onevar)

#### Example

```js
"requireMultipleVarDecl": true
```

##### Valid

```js
var x = 1;
var y = 2;

for (var i = 0, j = arr.length; i < j; i++) {}
```

##### Invalid

```js
var x = 1,
    y = 2;
```

### disallowEmptyBlocks

Disallows empty blocks (except for catch blocks).

Type: `Boolean`

Values: `true`

JSHint: [`noempty`](http://jshint.com/docs/options/#noempty)

#### Example

```js
"disallowEmptyBlocks": true
```

##### Valid

```js
if ( a == b ) { c = d; }
try { a = b; } catch( e ){}
```

##### Invalid

```js
if ( a == b ) { } else { c = d; }
```

### disallowSpacesInsideObjectBrackets

Disallows space after opening object curly brace and before closing.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpacesInsideObjectBrackets": true
```

##### Valid

```js
var x = {a: 1};
```

##### Invalid

```js
var x = { a: 1 };
```

### disallowSpacesInsideArrayBrackets

Disallows space after opening array square bracket and before closing.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpacesInsideArrayBrackets": true
```

##### Valid

```js
var x = [1];
```

##### Invalid

```js
var x = [ 1 ];
```

### disallowSpacesInsideParentheses

Disallows space after opening round bracket and before closing.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpacesInsideParentheses": true
```

##### Valid

```js
var x = (1 + 2) * 3;
```

##### Invalid

```js
var x = ( 1 + 2 ) * 3;
```

### requireSpacesInsideObjectBrackets

Requires space after opening object curly brace and before closing.

Type: `String`

Values: `"all"` for strict mode, `"allButNested"` ignores closing brackets in a row.

#### Example

```js
"requireSpacesInsideObjectBrackets": "all"
```

##### Valid for mode `"all"`

```js
var x = { a: { b: 1 } };
```

##### Valid for mode `"allButNested"`

```js
var x = { a: { b: 1 }};
```

##### Invalid

```js
var x = {a: 1};
```

### requireSpacesInsideArrayBrackets

Requires space after opening array square bracket and before closing.

Type: `String`

Values: "all" for strict mode, "allButNested" ignores closing brackets in a row.

#### Example

```js
"requireSpacesInsideArrayBrackets": "all"
```

##### Valid for mode `"all"`

```js
var x = [ 1 ];
```

##### Valid for mode `"allButNested"`

```js
var x = [[ 1 ], [ 2 ]];
```

##### Invalid

```js
var x = [1];
```

### disallowQuotedKeysInObjects

Disallows quoted keys in object if possible.

Type: `String` or `Boolean`

Values:

 - `true` for strict mode
 - `"allButReserved"` allows ES3+ reserved words to remain quoted which is helpfull when using this option with JSHint's `es3` flag.

#### Example

```js
"disallowQuotedKeysInObjects": true
```

##### Valid for mode `true`

```js
var x = { a: { default: 1 } };
```

##### Valid for mode `"allButReserved"`

```js
var x = {a: 1, 'default': 2};
```

##### Invalid

```js
var x = {'a': 1};
```

### disallowDanglingUnderscores

Disallows identifiers that start or end in `_`, except for some popular exceptions:

 - `_` (underscore.js)
 - `__filename` (node.js global)
 - `__dirname` (node.js global)

Type: `Boolean`

Values: `true`

JSHint: [`nomen`](http://www.jshint.com/docs/options/#nomen)

#### Example

```js
"disallowDanglingUnderscores": true
```

##### Valid

```js
var x = 1;
var y = _.extend;
var z = __dirname;
var w = __filename;
var x_y = 1;
```

##### Invalid

```js
var _x = 1;
var x_ = 1;
var x_y_ = 1;
```

### disallowSpaceAfterObjectKeys

Disallows space after object keys.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpaceAfterObjectKeys": true
```

##### Valid
```js
var x = {a: 1};
```
##### Invalid
```js
var x = {a : 1};
```

### requireSpaceAfterObjectKeys

Requires space after object keys.

Type: `Boolean`

Values: `true`

#### Example

```js
"requireSpaceAfterObjectKeys": true
```

##### Valid
```js
var x = {a : 1};
```
##### Invalid
```js
var x = {a: 1};
```

### disallowCommaBeforeLineBreak

Disallows commas as last token on a line in lists.

Type: `Boolean`

Values: `true`

JSHint: [`laxcomma`](http://www.jshint.com/docs/options/#laxcomma)

#### Example

```js
"disallowCommaBeforeLineBreak": true
```

##### Valid

```js
var x = {
    one: 1
    , two: 2
};
var y = { three: 3, four: 4};
```

##### Invalid

```js
var x = {
    one: 1,
    two: 2
};
```

### requireCommaBeforeLineBreak

Requires commas as last token on a line in lists.

Type: `Boolean`

Values: `true`

JSHint: [`laxcomma`](http://www.jshint.com/docs/options/#laxcomma)

#### Example

```js
"requireCommaBeforeLineBreak": true
```

##### Valid

```js
var x = {
    one: 1,
    two: 2
};
var y = { three: 3, four: 4};
```

##### Invalid

```js
var x = {
    one: 1
    , two: 2
};
```

### requireAlignedObjectValues

Requires proper alignment in object literals.

Type: `String`

Values:
    - `"all"` for strict mode,
    - `"skipWithFunction"` ignores objects if one of the property values is a function expression,
    - `"skipWithLineBreak"` ignores objects if there are line breaks between properties

#### Example

```js
"requireAlignedObjectValues": "all"
```

##### Valid
```js
var x = {
    a   : 1,
    bcd : 2,
    ef  : 'str'
};
```
##### Invalid
```js
var x = {
    a : 1,
    bcd : 2,
    ef : 'str'
};
```

### requireOperatorBeforeLineBreak

Requires operators to appear before line breaks and not after.

Type: `Array`

Values: Array of quoted operators

JSHint: [`laxbreak`](http://www.jshint.com/docs/options/#laxbreak)

#### Example

```js
"requireOperatorBeforeLineBreak": [
    "?",
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!==",
    ">",
    ">=",
    "<",
    "<="
]
```

##### Valid

```js
x = y ? 1 : 2;
x = y ?
    1 : 2;
```

##### Invalid

```js
x = y
    ? 1 : 2;
```

### disallowLeftStickedOperators

Disallows sticking operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowLeftStickedOperators": [
    "?",
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!==",
    ">",
    ">=",
    "<",
    "<="
]
```

##### Valid

```js
x = y ? 1 : 2;
```

##### Invalid

```js
x = y? 1 : 2;
```

### requireRightStickedOperators

Requires sticking operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireRightStickedOperators": ["!"]
```

##### Valid

```js
x = !y;
```

##### Invalid

```js
x = ! y;
```

### disallowRightStickedOperators

Disallows sticking operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowRightStickedOperators": [
    "?",
    "+",
    "/",
    "*",
    ":",
    "=",
    "==",
    "===",
    "!=",
    "!==",
    ">",
    ">=",
    "<",
    "<="
]
```

##### Valid
```js
x = y + 1;
```
##### Invalid
```js
x = y +1;
```

### requireLeftStickedOperators

Requires sticking operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireLeftStickedOperators": [","]
```

##### Valid

```js
x = [1, 2];
```

##### Invalid

```js
x = [1 , 2];
```

### disallowSpaceAfterPrefixUnaryOperators

Requires sticking unary operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"]
```

##### Valid

```js
x = !y; y = ++z;
```

##### Invalid

```js
x = ! y; y = ++ z;
```

### requireSpaceAfterPrefixUnaryOperators

Disallows sticking unary operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"]
```

##### Valid

```js
x = ! y; y = ++ z;
```

##### Invalid

```js
x = !y; y = ++z;
```

### disallowSpaceBeforePostfixUnaryOperators

Requires sticking unary operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowSpaceBeforePostfixUnaryOperators": ["++", "--"]
```

##### Valid

```js
x = y++; y = z--;
```

##### Invalid

```js
x = y ++; y = z --;
```

### requireSpaceBeforePostfixUnaryOperators

Disallows sticking unary operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireSpaceBeforePostfixUnaryOperators": ["++", "--"]
```

##### Valid

```js
x = y ++; y = z --;
```
##### Invalid

```js
x = y++; y = z--;
```

### disallowSpaceBeforeBinaryOperators

Requires sticking binary operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowSpaceBeforeBinaryOperators": [
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!=="
]
```

##### Valid

```js
x+ y;
```

##### Invalid

```js
x + y;
```

### requireSpaceBeforeBinaryOperators

Disallows sticking binary operators to the left.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireSpaceBeforeBinaryOperators": [
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!=="
]
```

##### Valid

```js
x !== y;
```

##### Invalid

```js
x!== y;
```

### disallowSpaceAfterBinaryOperators

Requires sticking binary operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"disallowSpaceAfterBinaryOperators": [
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!=="
]
```

##### Valid

```js
x +y;
```

##### Invalid

```js
x+ y;
```

### requireSpaceAfterBinaryOperators

Disallows sticking binary operators to the right.

Type: `Array`

Values: Array of quoted operators

#### Example

```js
"requireSpaceAfterBinaryOperators": [
    "+",
    "-",
    "/",
    "*",
    "=",
    "==",
    "===",
    "!=",
    "!=="
]
```

##### Valid

```js
x + y;
```

##### Invalid

```js
x +y;
```

### disallowImplicitTypeConversion

Disallows implicit type conversion.

Type: `Array`

Values: Array of quoted types

#### Example

```js
"disallowImplicitTypeConversion": ["numeric", "boolean", "binary", "string"]
```

##### Valid

```js
x = Boolean(y);
x = Number(y);
x = String(y);
x = s.indexOf('.') !== -1;
```

##### Invalid

```js
x = !!y;
x = +y;
x = '' + y;
x = ~s.indexOf('.');
```

### requireCamelCaseOrUpperCaseIdentifiers

Requires identifiers to be camelCased or UPPERCASE_WITH_UNDERSCORES

Type: `Boolean`

Values: `true`

JSHint: [`camelcase`](http://jshint.com/docs/options/#camelcase)

#### Example

```js
"requireCamelCaseOrUpperCaseIdentifiers": true
```

##### Valid

```js
var camelCase = 0;
var CamelCase = 1;
var _camelCase = 2;
var camelCase_ = 3;
var UPPER_CASE = 4;
```

##### Invalid

```js
var lower_case = 1;
var Mixed_case = 2;
var mixed_Case = 3;
```

### disallowKeywords

Disallows usage of specified keywords.

Type: `Array`

Values: Array of quoted keywords

#### Example

```js
"disallowKeywords": ["with"]
```

##### Invalid

```js
with (x) {
    prop++;
}
```
### disallowMultipleLineStrings

Disallows strings that span multiple lines without using concatenation.

Type: `Boolean`

Values: `true`

JSHint: [`multistr`](http://www.jshint.com/docs/options/#multistr)

#### Example

```js
"disallowMultipleLineStrings": true
```

##### Valid
```js
var x = "multi" +
        "line";
var y = "single line";
```

##### Invalid
```js
var x = "multi \
        line";
```

### disallowMultipleLineBreaks

Disallows multiple blank lines in a row.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowMultipleLineBreaks": true
```

##### Valid
```js
var x = 1;

x++;
```

##### Invalid
```js
var x = 1;


x++;
```

### validateLineBreaks

Option to check line break characters

Type: `String`

Values: `"CR"`, `"LF"`, `"CRLF"`

#### Example

```js
"validateLineBreaks": "LF"
```

##### Valid
```js
var x = 1;<LF>
x++;
```

##### Invalid
```js
var x = 1;<CRLF>
x++;
```

### validateQuoteMarks

Requires all quote marks to be either the supplied value, or consistent if `true`

Type: `String`

Values: `"\""`, `"'"`, `true`

JSHint: [`quotmark`](http://jshint.com/docs/options/#quotmark)

#### Example

```js
"validateQuoteMarks": "\""
```

##### Valid example for mode `"\""` or mode `true`

```js
var x = "x";
```

##### Valid example for mode `"'"` or mode `true`

```js
var x = 'x';
```

##### Invalid example for mode `true`

```js
var x = "x", y = 'y';
```

### validateIndentation

Validates indentation for arrays, objects, switch statements, and block statements

Type: `Integer` or `String`

Values: A positive integer or `"\t"`

JSHint: [`indent`](http://jshint.com/docs/options/#indent)

#### Example

```js
"validateIndentation": "\t",
```

##### Valid example for mode `2`

```js
if (a) {
  b=c;
  function(d) {
    e=f;
  }
}
```

##### Invalid example for mode `2`

```js
if (a) {
   b=c;
function(d) {
       e=f;
}
}
```

##### Valid example for mode "\t"

```js
if (a) {
    b=c;
    function(d) {
        e=f;
    }
}
```

##### Invalid example for mode "\t"

```js
if (a) {
     b=c;
function(d) {
           e=f;
 }
}
```

#### disallowMixedSpacesAndTabs

Requires lines to not contain both spaces and tabs consecutively,
or spaces after tabs only for alignment if "smart"

Type: `Boolean` or `String`

Values: `true` or `"smart"`

JSHint: [`smarttabs`](http://www.jshint.com/docs/options/#smarttabs)

#### Example

```js
"disallowMixedSpacesAndTabs": true
```

##### Valid example for mode `true`

```js
\tvar foo = "blah blah";
\s\s\s\svar foo = "blah blah";
\t/**
\t\s*
\t\s*/ //a single space to align the star in a docblock is allowed
```

##### Invalid example for mode `true`

```js
\t\svar foo = "blah blah";
\s\tsvar foo = "blah blah";
```

##### Valid example for mode `"smart"`

```js
\tvar foo = "blah blah";
\t\svar foo = "blah blah";
\s\s\s\svar foo = "blah blah";
\t/**
\t\s*
\t\s*/ //a single space to align the star in a docblock is allowed
```

##### Invalid example for mode `"smart"`

```js
\s\tsvar foo = "blah blah";
```

### disallowTrailingWhitespace

Requires all lines to end on a non-whitespace character

Type: `Boolean`

Values: `true`

JSHint: [`trailing`](http://jshint.com/docs/options/#trailing)

#### Example

```js
"disallowTrailingWhitespace": true
```

##### Valid

```js
var foo = "blah blah";
```

##### Invalid

```js
var foo = "blah blah"; //<-- whitespace character here
```

### disallowKeywordsOnNewLine

Disallows placing keywords on a new line.

Type: `Array`

Values: Array of quoted keywords

#### Example

```js
"disallowKeywordsOnNewLine": ["else"]
```

##### Valid

```js
if (x < 0) {
    x++;
} else {
    x--;
}
```

##### Invalid

```js
if (x < 0) {
    x++;
}
else {
    x--;
}
```

### requireKeywordsOnNewLine

Requires placing keywords on a new line.

Type: `Array`

Values: Array of quoted keywords

#### Example

```js
"requireKeywordsOnNewLine": ["else"]
```

##### Valid

```js
if (x < 0) {
    x++;
}
else {
    x--;
}
```

##### Invalid

```js
if (x < 0) {
    x++;
} else {
    x--;
}
```

### requireLineFeedAtFileEnd

Requires placing line feed at file end.

Type: `Boolean`

Values: `true`

#### Example

```js
"requireLineFeedAtFileEnd": true
```

### maximumLineLength

Requires all lines to be at most the number of characters specified

Type: `Integer`

Values: A positive integer

JSHint: [`maxlen`](http://jshint.com/docs/options/#maxlen)

#### Example

```js
"maximumLineLength": 40
```

##### Valid

```js
var aLineOf40Chars = 123456789012345678;
```

##### Invalid

```js
var aLineOf41Chars = 1234567890123456789;
```

### requireCapitalizedConstructors

Requires constructors to be capitalized (except for `this`)

Type: `Boolean`

Values: `true`

JSHint: [`newcap`](http://jshint.com/docs/options/#newcap)

#### Example

```js
"requireCapitalizedConstructors": true
```

##### Valid

```js
var a = new B();
var c = new this();
```

##### Invalid

```js
var d = new e();
```

### safeContextKeyword

Option to check `var that = this` expressions

Type: `String`

Values: String value used for context local declaration

#### Example

```js
"safeContextKeyword": "that"
```

##### Valid

```js
var that = this;
```

##### Invalid

```js
var _this = this;
```

### requireDotNotation

Requires member expressions to use dot notation when possible

Type: `Boolean`

Values: `true`

JSHint: [`sub`](http://www.jshint.com/docs/options/#sub)

#### Example

```js
"requireDotNotation": true
```

##### Valid

```js
var a = b[c];
var a = b.c;
var a = b[c.d];
var a = b[1];
var a = b['while']; //reserved word
```

##### Invalid

```js
var a = b['c'];
```

### validateJSDoc

Enables JSDoc validation.

Type: `Object`

Values:

 - "checkParamNames" ensures param names in jsdoc and in function declaration are equal
 - "requireParamTypes" ensures params in jsdoc contains type
 - "checkRedundantParams" reports redundant params in jsdoc

#### Example

```js
"validateJSDoc": {
    "checkParamNames": true,
    "checkRedundantParams": true,
    "requireParamTypes": true
}
```

##### Valid

```js
/**
 * Adds style error to the list
 *
 * @param {String} message
 * @param {Number|Object} line
 * @param {Number} [column]
 */
add: function(message, line, column) {
}
```

##### Invalid

```js
/**
 * Adds style error to the list
 *
 * @param {String} message
 * @param {Number|Object} line
 * @param {Number} [column]
 */
add: function() {
}
```

### excludeFiles

Disables style checking for specified paths.

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"excludeFiles": ["node_modules/**"]
```

### additionalRules

Path to load additional rules

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"additionalRules": ["project-rules/*.js"]
```

### preset

Extends defined rules with preset rules

Type: `String`

Values: `"jquery"`

#### Example

```js
"preset": "jquery"
```

## Browser Usage

File [jscs-browser.js](jscs-browser.js) contains browser-compatible version of `jscs`.

Download and include `jscs-browser.js` into your page.

```html
<script type="text/javascript" src="jscs-browser.js"></script>
<script type="text/javascript">
var checker = new JscsStringChecker();
checker.registerDefaultRules();
checker.configure({disallowMultipleVarDecl: true});
var errors = checker.checkString('var x, y = 1;');
errors.getErrorList().forEach(function(error) {
    console.log(errors.explainError(error));
});
</script>
```
