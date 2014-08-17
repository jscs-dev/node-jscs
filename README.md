# node-jscs [![Build Status](https://travis-ci.org/mdevils/node-jscs.svg?branch=master)](https://travis-ci.org/mdevils/node-jscs) [![Dependency Status](https://david-dm.org/mdevils/node-jscs.svg?theme=shields.io)](https://david-dm.org/mdevils/node-jscs) [![devDependency Status](https://david-dm.org/mdevils/node-jscs/dev-status.svg?theme=shields.io)](https://david-dm.org/mdevils/node-jscs#info=devDependencies)

JSCS — JavaScript Code Style.

`jscs` is a code style checker. You can configure `jscs` for your project in detail using **over 60** validation rules, including presets from popular style guides like jQuery.

**This is a documentation for the development version, please refer to the https://www.npmjs.org/package/jscs instead**

## Presets

 * [Crockford](presets/crockford.json) - http://javascript.crockford.com/code.html
 * [Google](presets/google.json) - https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * [jQuery](presets/jquery.json) - https://contribute.jquery.org/style-guide/js/
 * [MDCS](presets/mdcs.json) - https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2
 * [Wikimedia](presets/wikimedia.json) - https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
 * [Yandex](presets/yandex.json) - https://github.com/ymaps/codestyle/blob/master/js.md

## Friendly packages

 * Grunt task: https://github.com/gustavohenke/grunt-jscs/
 * Gulp task: https://github.com/sindresorhus/gulp-jscs/
 * SublimeText 3 Plugin: https://github.com/SublimeLinter/SublimeLinter-jscs/
 * Syntastic VIM Plugin: [https://github.com/scrooloose/syntastic/.../syntax_checkers/javascript/jscs.vim/](https://github.com/scrooloose/syntastic/blob/master/syntax_checkers/javascript/jscs.vim/)
 * Atom editor: https://atom.io/packages/linter-jscs
 * Web Essentials for Visual Studio 2013: https://github.com/madskristensen/WebEssentials2013/

### Extensions

 * Brackets Extension: https://github.com/globexdesigns/brackets-jscs
 * A team city reporter: https://github.com/wurmr/jscs-teamcity-reporter
 * JSdoc rules extension: https://github.com/zxqfox/jscs-jsdoc

## Installation

`jscs` can be installed using `npm`:

```
npm install jscs -g
```

To run `jscs`, you can use the following command from the project root:

```
jscs path[ path[...]]
```

You can also pipe input into jscs:

```
cat myfile.js | jscs
```

## CLI

### `--config`
Allows to define path to the config file.
```
jscs path[ path[...]] --config=./.config.json
```

If there is no `--config` option specified, `jscs` it will consequentially search for `jscsConfig` option in `package.json` file then for `.jscsrc` and `.jscs.json` files in the current working directory then in nearest ancestor until it hits the system root.

### `--preset`
If defined will use predefined rules for specific code style.
```
jscs path[ path[...]] --preset=jquery
```

### `--reporter`
`jscs` itself provides six reporters: `checkstyle`, `console`, `inline`, `junit` and `text`.
```
jscs path[ path[...]] --reporter=console
```

But you also can specify your own reporter, since this flag accepts relative or absolute paths too.
```
jscs path[ path[...]] --reporter=./some-dir/my-reporter.js
```

### `--no-colors`
*Will be removed*. Clean output without colors.

### `--help`
Outputs usage information.

### `--verbose`
Prepends the name of the offending rule to all error messages.

### `--version`
Outputs version of `jscs`.

## Options

### additionalRules

Path to load additional rules

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"additionalRules": ["project-rules/*.js"]
```

### preset

Extends defined rules with preset rules.

Type: `String`

Values: `"crockford"`, `"google"`, `"jquery"`, `"mdcs"`, `"wikimedia"`, `"yandex"`

#### Example

```js
"preset": "jquery"
```

If you want specifically disable preset rule assign it to `null`, like so:
```json
{
    "preset": "jquery",
    "requireCurlyBraces": null
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

### fileExtensions

Changes the set of file extensions that will be processed.

Type: `Array` or `String` or `"*"`

Values: A single file extension or an Array of file extensions, beginning with a `.`. The matching is case _insensitive_. If `"*"` is provided, all files regardless of extension will match.

#### Example

```js
"fileExtensions": [".js", ".jsx"]
```

#### Default

```js
"fileExtensions": [".js"]
```

## Error Suppression

### Disabling Rules From Presets

After using the `preset` option, you can set any rules values to `null` to remove it. i.e. The following config will use the jQuery preset except will
not require the use of `a.b` over `a['b']`.:
```
{
    "preset": "jquery",
    "requireDotNotation": null
}
```

### Inline Comments

You can disable and reenable rules inline with two special comments: `//jscs:disable` and `//jscs:enable`. Spacing in these comments is fairly lenient. All of the following are equivalent:
```
/* jscs: enable */
// jscs: enable
//jscs: enable
// jscs:enable
```
You can use them to disable rules in several ways.

#### Disabling All Rules

Simply using `//jscs:disable` or `//jscs:enable` will disable all rules.
```
var a = b;
//jscs:disable
var c = d; // all errors on this line will be ignored
//jscs:enable
var e = f; // all errors on this line will be reported
```

#### Disabling Specific Rules

Including a comma separated list of rules to modify after `//jscs:disable` or `//jscs:enable` will modify only those rules.
```
//jscs:disable requireCurlyBraces
if (x) y(); // all errors from requireCurlyBraces on this line will be ignored
//jscs:enable requireCurlyBraces
if (z) a(); // all errors, including from requireCurlyBraces, on this line will be reported
```

You can enable all rules after disabling a specific rule, and that rule becomes reenabled as well.
```
//jscs:disable requireCurlyBraces
if (x) y(); // all errors from requireCurlyBraces on this line will be ignored
//jscs:enable
if (z) a(); // all errors, even from requireCurlyBraces, will be reported
```

You can disable multiple rules at once and progressively reeanble them.
```
//jscs:disable requireCurlyBraces, requireDotNotation
if (x['a']) y(); // all errors from requireCurlyBraces OR requireDotNotation on this line will be ignored
//jscs:enable requireCurlyBraces
if (z['a']) a(); // all errors from requireDotNotation, but not requireCurlyBraces, will be ignored
//jscs:enable requireDotNotation
if (z['a']) a(); // all errors will be reported
```

## Rules

### requireCurlyBraces

Requires curly braces after statements.

Type: `Array`

Values: Array of quoted keywords

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


### requireSpaceBeforeBlockStatements

Requires space before block statements (for loops, control structures).

Type: `Boolean`

Values: `true`

#### Example

```js
"requireSpaceBeforeBlockStatements": true
```

##### Valid

```js
if (cond) {
  foo();
}

for (var e in elements) {
  bar(e);
}

while (cond) {
  foo();
}
```

##### Invalid

```js
if (cond){
  foo();
}

for (var e in elements){
  bar(e);
}

while (cond){
  foo();
}
```


### disallowSpaceBeforeBlockStatements

Disallows space before block statements (for loops, control structures).

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpaceBeforeBlockStatements": true
```

##### Valid

```js
if (cond){
  foo();
}

for (var e in elements){
  bar(e);
}

while (cond){
  foo();
}
```

##### Invalid

```js
if (cond) {
  foo();
}

for (var e in elements) {
  bar(e);
}

while (cond) {
  foo();
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


### requireSpacesInConditionalExpression

Requires space before and/or after `?` or `:` in conditional expressions.

Type: `Object` or `Boolean`

Values: `"afterTest"`, `"beforeConsequent"`, `"afterConsequent"`, `"beforeAlternate"` as child properties, or `true` to set all properties to `true`. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInConditionalExpression": {
    "afterTest": true,
    "beforeConsequent": true,
    "afterConsequent": true,
    "beforeAlternate": true
}
```

##### Valid

```js
var a = b ? c : d;
var a= b ? c : d;
```

##### Invalid

```js
var a = b? c : d;
var a = b ?c : d;
var a = b ? c: d;
var a = b ? c :d;
```


### disallowSpacesInConditionalExpression

Disallows space before and/or after `?` or `:` in conditional expressions.

Type: `Object` or `Boolean`

Values: `"afterTest"`, `"beforeConsequent"`, `"afterConsequent"`, `"beforeAlternate"` as child properties, or `true` to set all properties to true. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInConditionalExpression": {
    "afterTest": true,
    "beforeConsequent": true,
    "afterConsequent": true,
    "beforeAlternate": true
}
```

##### Valid

```js
var a = b?c:d;
var a= b?c:d;
```

##### Invalid

```js
var a = b ?c:d;
var a = b? c:d;
var a = b?c :d;
var a = b?c: d;
```



### requireSpacesInFunctionExpression

Requires space before `()` or `{}` in function expressions (both named and anonymous).

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

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

Disallows space before `()` or `{}` in function expressions (both named and anonymous).

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


### requireSpacesInAnonymousFunctionExpression

Requires space before `()` or `{}` in anonymous function expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInAnonymousFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function () {}
```

##### Invalid

```js
function() {}
function (){}
```


### disallowSpacesInAnonymousFunctionExpression

Disallows space before `()` or `{}` in anonymous function expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInAnonymousFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function(){}
```

##### Invalid

```js
function () {}
function (){}
```


### requireSpacesInNamedFunctionExpression

Requires space before `()` or `{}` in named function expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInNamedFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a () {}
```

##### Invalid

```js
function a() {}
function a(){}
```


### disallowSpacesInNamedFunctionExpression

Disallows space before `()` or `{}` in named function expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInNamedFunctionExpression": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a(){}
```

##### Invalid

```js
function a () {}
function a (){}
```


### requireSpacesInFunctionDeclaration

Requires space before `()` or `{}` in function declarations.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInFunctionDeclaration": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a () {}
```

##### Invalid

```js
function a() {}
function a (){}
```


### disallowSpacesInFunctionDeclaration

Disallows space before `()` or `{}` in function declarations.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInFunctionDeclaration": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a(){}
```

##### Invalid

```js
function a () {}
function a (){}
```


### requireSpacesInFunction

Requires space before `()` or `{}` in function declarations and expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"requireSpacesInFunction": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a () {}
```

##### Invalid

```js
function a() {}
function a (){}
```


### disallowSpacesInFunction

Disallows space before `()` or `{}` in function declarations and expressions.

Type: `Object`

Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties. Child properties must be set to `true`.

#### Example

```js
"disallowSpacesInFunction": {
    "beforeOpeningRoundBrace": true,
    "beforeOpeningCurlyBrace": true
}
```

##### Valid

```js
function a(){}
```

##### Invalid

```js
function a () {}
function a (){}
```


### disallowMultipleVarDecl

Disallows multiple `var` declaration (except for-loop).

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowMultipleVarDecl": true
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

### requireMultipleVarDecl

Requires multiple `var` declaration.

Type: `Boolean` or `String`

Values: `true` or `"onevar"`

if `requireMultipleVarDecl` defined as a `true` value, it will report only consecutive vars, if, on the other hand,
value equals to `"onevar"` string, `requireMultipleVarDecl` will allow only one `var` per function scope.

JSHint: [`onevar`](http://jshint.com/docs/options/#onevar)

#### Example

```js
"requireMultipleVarDecl": true
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

### requireBlocksOnNewline

Requires blocks to begin and end with a newline

Type: `Boolean` or `Integer`

Values: `true` validates all non-empty blocks, `Integer` specifies a minimum number of statements in the block before validating.

#### Example

```js
"requireBlocksOnNewline": true
```

##### Valid for mode `true`

```js
if (true) {
    doSomething();
}
var abc = function() {};
```

##### Invalid

```js
if (true) {doSomething();}
```

##### Valid for mode `1`

```js
if (true) {
    doSomething();
    doSomethingElse();
}
if (true) { doSomething(); }
var abc = function() {};
```

##### Invalid

```js
if (true) { doSomething(); doSomethingElse(); }
```

### requirePaddingNewlinesInBlocks

Requires blocks to begin and end with 2 newlines

Type: `Boolean` or `Integer`

Values: `true` validates all non-empty blocks, `Integer` specifies a minimum number of statements in the block before validating.

#### Example

```js
"requirePaddingNewlinesInBlocks": true
```

##### Valid for mode `true`

```js
if (true) {

    doSomething();

}
var abc = function() {};
```

##### Invalid

```js
if (true) {doSomething();}
if (true) {
    doSomething();
}
```

##### Valid for mode `1`

```js
if (true) {

    doSomething();
    doSomethingElse();

}
if (true) {
    doSomething();
}
if (true) { doSomething(); }
var abc = function() {};
```

##### Invalid

```js
if (true) { doSomething(); doSomethingElse(); }
if (true) {
    doSomething();
    doSomethingElse();
}
```

### disallowPaddingNewlinesInBlocks

Disallows blocks from beginning and ending with 2 newlines.

Type: `Boolean`

Values: `true` validates all non-empty blocks.

#### Example

```js
"disallowPaddingNewlinesInBlocks": true
```

##### Valid

```js
if (true) {
    doSomething();
}
if (true) {doSomething();}
var abc = function() {};
```

##### Invalid

```js
if (true) {

    doSomething();

}
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

Type: `Boolean` or `String`

Values: `"all"` or `true` for strict mode, `"nested"` ignores closing brackets in a row.

#### Example

```js
"disallowSpacesInsideObjectBrackets": "all"
```

##### Valid for mode `"all"`

```js
var x = {a: {b: 1}};
```

##### Valid for mode `"nested"`

```js
var x = { a: {b: 1} };
```

##### Invalid

```js
var x = { a: { b: 1 } };
```

### disallowSpacesInsideArrayBrackets

Disallows space after opening array square bracket and before closing.

Type: `Boolean` or `String`

Values: `"all"` or `true` for strict mode, `"nested"` ignores closing brackets in a row.

#### Example

```js
"disallowSpacesInsideArrayBrackets": "all"
```

##### Valid for mode `"all"`

```js
var x = [[1]];
```

##### Valid for mode `"nested"`

```js
var x = [ [1] ];
```

##### Invalid

```js
var x = [ [ 1 ] ];
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

Values: `"all"` for strict mode, `"allButNested"` ignores closing brackets in a row.

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

### requireSpacesInsideParentheses

Requires space after opening round bracket and before closing.

Type: `String`

Values: `"all"` for strict mode, `"allButNested"` ignores nested brackets in a row.

#### Example

```js
"requireSpacesInsideParentheses": "all"
```

##### Valid for mode `"all"`

```js
var x = Math.pow( ( 1 + 2 ), ( 3 + 4 ) );
```

##### Valid for mode `"allButNested"`

```js
var x = Math.pow(( 1 + 2 ), ( 3 + 4 ));
```

##### Invalid

```js
var x = Math.pow(1 + 2, 3 + 4);
```


### disallowQuotedKeysInObjects

Disallows quoted keys in object if possible.

Type: `String` or `Boolean`

Values:

 - `true` for strict mode
 - `"allButReserved"` allows ES3+ reserved words to remain quoted which is helpful when using this option with JSHint's `es3` flag.

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
 - `"ignoreFunction"` ignores objects if one of the property values is a function expression,
 - `"ignoreLineBreak"` ignores objects if there are line breaks between properties

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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to require all possible binary operators to appear before line breaks

JSHint: [`laxbreak`](http://www.jshint.com/docs/options/#laxbreak)

#### Example

```js
"requireOperatorBeforeLineBreak": [
    "?",
    "=",
    "+",
    "-",
    "/",
    "*",
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

### disallowSpaceAfterPrefixUnaryOperators

Requires sticking unary operators to the right.

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to disallow space after prefix for all unary operators

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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to require space after prefix for all unary operators

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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to disallow space before postfix for all unary operators (i.e. increment/decrement operators)

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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to require space before postfix for all unary operators (i.e. increment/decrement operators)

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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to disallow space before all possible binary operators

#### Example

```js
"disallowSpaceBeforeBinaryOperators": [
    "=",
    ",",
    "+",
    "-",
    "/",
    "*",
    "==",
    "===",
    "!=",
    "!=="
    // etc
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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to require space before all possible binary operators
without comma operator, since it's rarely used with this rule


#### Example

```js
"requireSpaceBeforeBinaryOperators": [
    "=",
    ",",
    "+",
    "-",
    "/",
    "*",
    "==",
    "===",
    "!=",
    "!=="
    // etc
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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to disallow space after all possible binary operators

#### Example

```js
"disallowSpaceAfterBinaryOperators": [
    "=",
    ",",
    "+",
    "-",
    "/",
    "*",
    "==",
    "===",
    "!=",
    "!=="
    // etc
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

Type: `Array` or `Boolean`

Values: Array of quoted operators or `true` to require space after all possible binary operators

#### Example

```js
"requireSpaceAfterBinaryOperators": [
    "=",
    ",",
    "+",
    "-",
    "/",
    "*",
    "==",
    "===",
    "!=",
    "!=="
    // etc
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

Type: `Boolean` or `String`

Values: `true` or `"ignoreProperties"`

JSHint: [`camelcase`](http://jshint.com/docs/options/#camelcase)

#### Example

```js
"requireCamelCaseOrUpperCaseIdentifiers": true
```

##### Valid for mode `true`

```js
var camelCase = 0;
var CamelCase = 1;
var _camelCase = 2;
var camelCase_ = 3;
var UPPER_CASE = 4;
```

##### Invalid for mode `true`

```js
var lower_case = 1;
var Mixed_case = 2;
var mixed_Case = 3;
```

##### Valid for mode `ignoreProperties`

```js
var camelCase = 0;
var CamelCase = 1;
var _camelCase = 2;
var camelCase_ = 3;
var UPPER_CASE = 4;
var obj.snake_case = 5;
var camelCase = { snake_case: 6 };
```

##### Invalid for mode `ignoreProperties`

```js
var lower_case = 1;
var Mixed_case = 2;
var mixed_Case = 3;
var snake_case = { snake_case: 6 };
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

Type: `String` or `Object`

Values:
 - `"\""`: all strings require double quotes
 - `"'"`: all strings require single quotes
 - `true`: all strings require the quote mark first encountered in the source code
 - `Object`:
    - `escape`: allow the "other" quote mark to be used, but only to avoid having to escape
    - `mark`: the same effect as the non-object values

JSHint: [`quotmark`](http://jshint.com/docs/options/#quotmark)

#### Example

```js
"validateQuoteMarks": "\""
```
```js
"validateQuoteMarks": { "mark": "\"", "escape": true }
```

##### Valid example for mode `{ "mark": "\"", "escape": true }`

```js
var x = "x";
var y = '"x"';
```
##### Invalid example for mode `{ "mark": "\"", "escape": true }`

```js
var x = "x";
var y = 'x';
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
"validateIndentation": "\t"
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

### disallowMixedSpacesAndTabs

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
\t\s*/ //a single space to align the star in a multi-line comment is allowed
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
\t\s*/ //a single space to align the star in a multi-line comment is allowed
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

### disallowTrailingComma

Disallows an extra comma following the final element of an array or object literal.

Type: `Boolean`

Values: `true`

JSHint: [`es3`](http://jshint.com/docs/options/#es3)

#### Example

```js
"disallowTrailingComma": true
```

##### Valid

```js
var foo = [1, 2, 3];
var bar = {a: "a", b: "b"}
```

##### Invalid

```js
var foo = [1, 2, 3, ];
var bar = {a: "a", b: "b", }
```

### requireTrailingComma

Requires an extra comma following the final element of an array or object literal.

Type: `Boolean` or `Object`

Values:

- `true`: validates all arrays and objects
- `Object`:
   - `ignoreSingleValue`: allows single property objects and single element arrays to not require a trailing comma

#### Example

```js
"requireTrailingComma": true
```

##### Valid

```js
var foo = [1, 2, 3,];
var bar = {a: "a", b: "b",}
```

##### Valid with ignoreSingleValue

```js
var car = [1];
var dar = {a: "a"};
```

##### Invalid

```js
var foo = [1, 2, 3];
var bar = {a: "a", b: "b"}
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

Type: `Integer` or `Object`

Values:
 - `Integer`: lines should be at most the number of characters specified
 - `Object`:
    - `value`: (required) lines should be at most the number of characters specified
    - `tabSize`: (default: `1`) considered the tab character as number of specified spaces
    - `allowComments`: (default: `false`) allows comments to break the rule
    - `allowUrlComments`: (default: `false`) allows comments with long urls to break the rule
    - `allowRegex`: (default: `false`) allows regular expression literals to break the rule

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

Type: `Array` or `String`

Values: String value used for context local declaration

#### Example

```js
"safeContextKeyword": ["that"]
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

### requireYodaConditions

Requires the variable to be the right hand operator when doing a boolean comparison

Type: `Boolean`

Values: `true`

#### Example

```js
"requireYodaConditions": true
```

##### Valid
```js
if (1 == a) {
  return
}
```

##### Invalid

```js
if (a == 1) {
  return
}
```

### disallowYodaConditions

Requires the variable to be the left hand operator when doing a boolean comparison

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowYodaConditions": true
```

##### Valid

```js
if (a == 1) {
  return
}
```

##### Invalid

```js
if (1 == a) {
  return
}
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

### requireSpaceAfterLineComment

Requires that a line comment (`//`) be followed by a space.

Type: `Boolean`

Values: `true`

#### Example

```js
"requireSpaceAfterLineComment": true
```

##### Valid

```js
// A comment
/*A comment*/
```

##### Invalid

```js
//A comment
```

### disallowSpaceAfterLineComment

Requires that a line comment (`//`) not be followed by a space.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowSpaceAfterLineComment": true
```

##### Valid

```js
//A comment
/* A comment*/
```

##### Invalid

```js
// A comment
```

### disallowAnonymousFunctions

Requires that a function expression be named.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowAnonymousFunctions": true
```

##### Valid

```js
var a = function foo(){

};

$('#foo').click(function bar(){

};)
```

##### Invalid

```js
var a = function(){

};

$('#foo').click(function(){

};)
```

### requireAnonymousFunctions

Requires that a function expression be anonymous.

Type: `Boolean`

Values: `true`

#### Example

```js
"requireAnonymousFunctions": true
```

##### Valid

```js
var a = function(){

};

$('#foo').click(function(){

};)
```

##### Invalid

```js
var a = function foo(){

};

$('#foo').click(function bar(){

};)
```

### disallowNewlineBeforeBlockStatements

Disallows newline before opening curly brace of all block statements.

Type: `Boolean`

Values: `true`

#### Example

```js
"disallowNewlineBeforeBlockStatements": true
```

##### Valid

```js
function good(){
    var obj = {
        val: true
    };

    return {
        data: obj
    };
}

if (cond){
    foo();
}

for (var e in elements){
    bar(e);
}

while (cond){
    foo();
}
```

##### Invalid

```js
function bad()
{
    var obj =
    {
        val: true
    };

    return {
        data: obj
    };
}

if (cond)
{
    foo();
}

for (var e in elements)
{
    bar(e);
}

while (cond)
{
    foo();
}
```

### requireNewlineBeforeBlockStatements

Requires newline before opening curly brace of all block statements.

Type: `Boolean`

Values: `true`

#### Example

```js
"requireNewlineBeforeBlockStatements": true
```

##### Valid

```js
function good()
{
    var obj =
    {
        val: true
    };

    return {
        data: obj
    };
}

if (cond)
{
    foo();
}

for (var e in elements)
{
    bar(e);
}

while (cond)
{
    foo();
}
```

##### Invalid

```js
function bad(){
    var obj = {
        val: true
    };

    return {
        data: obj
    };
}

if (cond){
    foo();
}

for (var e in elements){
    bar(e);
}

while (cond){
    foo();
}
```

## Removed Rules

### ~~disallowLeftStickedOperators~~

Use the following rules instead:

* requireSpaceBeforeBinaryOperators
* requireSpaceBeforePostfixUnaryOperators
* requireSpacesInConditionalExpression

### ~~disallowRightStickedOperators~~

Use the following rules instead:

* requireSpaceAfterBinaryOperators
* requireSpaceAfterPrefixUnaryOperators
* requireSpacesInConditionalExpression

### ~~requireLeftStickedOperators~~

Use the following rules instead:

* disallowSpaceBeforeBinaryOperators
* disallowSpaceBeforePostfixUnaryOperators
* disallowSpacesInConditionalExpression

### ~~requireRightStickedOperators~~

Use the following rules instead:

* disallowSpaceAfterBinaryOperators
* disallowSpaceAfterPrefixUnaryOperators
* disallowSpacesInConditionalExpression

## Browser Usage

The npm package contains a file named `jscs-browser.js` (since version `1.5.7`), which is a browser compatible version of `jscs`.

If you'd like to generate this file yourself, run `npm run browserify` after cloning this repo.

Use `jscs-browser.js` on your page as follows:

```html
<script src="jscs-browser.js"></script>
<script>
    var checker = new JscsStringChecker();
    checker.registerDefaultRules();
    checker.configure({disallowMultipleVarDecl: true});
    var errors = checker.checkString('var x, y = 1;');
    errors.getErrorList().forEach(function(error) {
        console.log(errors.explainError(error));
    });
</script>
```
