node-jscs [![Build Status](https://travis-ci.org/mdevils/node-jscs.png?branch=master)](https://travis-ci.org/mdevils/node-jscs)
=========

JSCS — JavaScript Code Style.

`jscs` is a code style checker. `jscs` can check cases, which are not implemeted in jshint,
but it does not duplicate `jshint` functionality, so you should use `jscs` and `jshint` together.

Friendly packages
-----------------

 * JSCS Grunt Task: https://github.com/gustavohenke/grunt-jscs-checker

Installation
------------

`jscs` can be installed using `npm`:

```
npm install jscs
```

To run `jscs`, you can use the following command from the project root:

```
./node_modules/.bin/jscs path[ path[...]]
```

Configuration
-------------

`jscs` is configured using `.jscs.json` file, located in the project root.

Example configuration:

```javascript
{
    /*
        Option: requireCurlyBraces
        Requires curly braces after statements.

        Valid example:

        if (x) {
            x++;
        }

        Invalid example:

        if (x) x++;
    */
    "requireCurlyBraces": ["if", "else", "for", "while", "do"],

    /*
        Option: requireSpaceAfterKeywords
        Requires space after keyword.

        Valid example:

        return true;

        Invalid example:

        if(x) {
            x++;
        }
    */
    "requireSpaceAfterKeywords": ["if", "else", "for", "while", "do", "switch", "return"],

    /*
        Option: disallowSpaceAfterKeywords
        Disallows space after keyword.

        Valid example:

        if(x > y) {
            y++;
        }
    */
    "disallowSpaceAfterKeywords": ["if", "else", "for", "while", "do", "switch"],


    /*
        Option: requireSpacesInFunctionExpression
        Requires space before () or {} in function declarations.

        Valid examples:
        function () {}
        function a () {}

        Invalid examples:
        function() {}
        function (){}

    */
    "requireSpacesInFunctionExpression": { "beforeOpeningRoundBrace": true, "beforeOpeningCurlyBrace": true },

    /*
        Option: disallowSpacesInFunctionExpression
        Disallows space before () or {} in function declarations.

        Valid examples:
        function(){}
        function a(){}

        Invalid examples:
        function () {}
        function a (){}

    */
    "disallowSpacesInFunctionExpression": { "beforeOpeningRoundBrace": true, "beforeOpeningCurlyBrace": true },

    /*
        Option: disallowMultipleVarDecl
        Disallows multiple var declaration (except for-loop).

        Valid example:

        var x = 1;
        var y = 2;

        for (var i = 0, j = arr.length; i < j; i++) {}

        Invalid example:

        var x = 1,
            y = 2;
    */
    "disallowMultipleVarDecl": true,

    /*
        Option: requireMultipleVarDecl
        Requires multiple var declaration.

        Valid example:

        var x = 1,
            y = 2;

        Invalid example:

        var x = 1;
        var y = 2;
    */
    "requireMultipleVarDecl": true,

    /*
        Option: disallowSpacesInsideObjectBrackets
        Disallows space after opening object curly brace and before closing.

        Valid example:

        var x = {a: 1};

        Invalid example:

        var x = { a: 1 };
    */
    "disallowSpacesInsideObjectBrackets": true,

    /*
        Option: disallowSpacesInsideArrayBrackets
        Disallows space after opening array square bracket and before closing.

        Valid example:

        var x = [1];

        Invalid example:

        var x = [ 1 ];
    */
    "disallowSpacesInsideArrayBrackets": true,

    /*
        Option: disallowSpacesInsideParentheses
        Disallows space after opening round bracket and before closing.

        Valid example:

        var x = (1 + 2) * 3;

        Invalid example:

        var x = ( 1 + 2 ) * 3;
    */
    "disallowSpacesInsideParentheses": true,

    /*
        Option: requireSpacesInsideObjectBrackets
        Possible values: "all" for strict mode, "allButNested" ignores closing brackets in a row.
        Requires space after opening object curly brace and before closing.

        Valid example for mode "all":

        var x = { a: { b: 1 } };

        Valid example for mode "allButNested":

        var x = { a: { b: 1 }};

        Invalid example:

        var x = {a: 1};
    */
    "requireSpacesInsideObjectBrackets": "all",

    /*
        Option: requireSpacesInsideArrayBrackets
        Possible values: "all" for strict mode, "allButNested" ignores closing brackets in a row.
        Requires space after opening array square bracket and before closing.

        Valid example for mode "all":

        var x = [ 1 ];

        Valid example for mode "allButNested":

        var x = [[ 1 ], [ 2 ]];

        Invalid example:

        var x = [1];
    */
    "requireSpacesInsideArrayBrackets": "all",

    /*
        Option: disallowQuotedKeysInObjects
        Possible values:
            `true`: for strict mode,
            "allButReserved" allows ES3+ reserved words to remain quoted. This is helpfull when using this option with JSHint's `es3` option.
        Disallows quoted keys in object if possible.

        Valid example for mode true:

        var x = { a: { default: 1 } };

        Valid example for mode "allButReserved":

        var x = {a: 1, 'default': 2};

        Invalid example:

        var x = {'a': 1};
    */
    "disallowQuotedKeysInObjects": true,

    /*
        Option: disallowSpaceAfterObjectKeys
        Disallows space after object keys.

        Valid example:

        var x = {a: 1};

        Invalid example:

        var x = {a : 1};
    */
    "disallowSpaceAfterObjectKeys": true,

    /*
        Option: requireSpaceAfterObjectKeys
        Requires space after object keys.

        Valid example:

        var x = {a : 1};

        Invalid example:

        var x = {a: 1};
    */
    "requireSpaceAfterObjectKeys": true,

    /*
        Option: requireAlignedObjectValues
        Possible values:
            "all" for strict mode,
            "skipWithFunction" ignores objects if one of the property values is a function expression,
            "skipWithLineBreak" ignores objects if there are line breaks between properties
        Requires proper alignment in object literals.

        Valid example:

        var x = {
            a   : 1,
            bcd : 2,
            ef  : 'str'
        };

        Invalid example:

        var x = {
            a : 1,
            bcd : 2,
            ef : 'str'
        };
    */
    "requireAlignedObjectValues": "all",

    /*
        Option: disallowLeftStickedOperators
        Disallows sticking operators to the left.

        Valid example:

        x = y ? 1 : 2;

        Invalid example:

        x = y? 1 : 2;
    */
    "disallowLeftStickedOperators": ["?", "+", "-", "/", "*", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<="],

    /*
        Option: requireRightStickedOperators
        Requires sticking operators to the right.

        Valid example:

        x = !y;

        Invalid example:

        x = ! y;
    */
    "requireRightStickedOperators": ["!"],

    /*
        Option: disallowRightStickedOperators
        Disallows sticking operators to the right.

        Valid example:

        x = y + 1;

        Invalid example:

        x = y +1;
    */
    "disallowRightStickedOperators": ["?", "+", "/", "*", ":", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<="],

    /*
        Option: requireLeftStickedOperators
        Requires sticking operators to the left.

        Valid example:

        x = [1, 2];

        Invalid example:

        x = [1 , 2];
    */
    "requireLeftStickedOperators": [","],

    /*
        Option: disallowSpaceAfterPrefixUnaryOperators
        Requires sticking unary operators to the right.

        Valid example:

        x = !y; y = ++z;

        Invalid example:

        x = ! y; y = ++ z;
    */
    "disallowSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"],

    /*
        Option: requireSpaceAfterPrefixUnaryOperators
        Disallows sticking unary operators to the right.

        Valid example:

        x = ! y; y = ++ z;

        Invalid example:

        x = !y; y = ++z;
    */
    "requireSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"],

    /*
        Option: disallowSpaceBeforePostfixUnaryOperators
        Requires sticking unary operators to the left.

        Valid example:

        x = y++; y = z--;

        Invalid example:

        x = y ++; y = z --;
    */
    "disallowSpaceBeforePostfixUnaryOperators": ["++", "--"],

    /*
        Option: requireSpaceBeforePostfixUnaryOperators
        Disallows sticking unary operators to the left.

        Valid example:

        x = y ++; y = z --;

        Invalid example:

        x = y++; y = z--;
    */
    "requireSpaceBeforePostfixUnaryOperators": ["++", "--"],

    /*
        Option: disallowSpaceBeforeBinaryOperators
        Requires sticking binary operators to the left.

        Valid example:

        x+ y;

        Invalid example:

        x + y;
    */
    "disallowSpaceBeforeBinaryOperators": ["+", "-", "/", "*", "=", "==", "===", "!=", "!=="],

    /*
        Option: requireSpaceBeforeBinaryOperators
        Disallows sticking binary operators to the left.

        Valid example:

        x !== y;

        Invalid example:

        x!== y;
    */
    "requireSpaceBeforeBinaryOperators": ["+", "-", "/", "*", "=", "==", "===", "!=", "!=="],

    /*
        Option: disallowSpaceAfterBinaryOperators
        Requires sticking binary operators to the right.

        Valid example:

        x +y;

        Invalid example:

        x+ y;
    */
    "disallowSpaceAfterBinaryOperators": ["+", "-", "/", "*", "=", "==", "===", "!=", "!=="],

    /*
        Option: requireSpaceAfterBinaryOperators
        Disallows sticking binary operators to the right.

        Valid example:

        x + y;

        Invalid example:

        x +y;
    */
    "requireSpaceAfterBinaryOperators": ["+", "-", "/", "*", "=", "==", "===", "!=", "!=="],

    /*
        Option: disallowImplicitTypeConversion
        Disallows implicit type conversion.

        Valid example:

        x = Boolean(y);
        x = Number(y);
        x = String(y);
        x = s.indexOf('.') !== -1;

        Invalid example:

        x = !!y;
        x = +y;
        x = '' + y;
        x = ~s.indexOf('.');
    */
    "disallowImplicitTypeConversion": ["numeric", "boolean", "binary", "string"],

    /*
        Option: disallowKeywords
        Disallows usage of specified keywords.

        Invalid example:

        with (x) {
            prop++;
        }
    */
    "disallowKeywords": ["with"],

    /*
        Option: disallowMultipleLineBreaks
        Disallows multiple blank lines in a row.

        Invalid example:

        var x = 1;


        x++;
    */
    "disallowMultipleLineBreaks": true,

    /*
        Option: validateLineBreaks
        Possible values: "CR", "LF", "CRLF"
        Option to check line break characters

        Invalid example:

        var x = 1;<CRLF>
        x++;
    */
    "validateLineBreaks": "LF",

    /*
        Option: disallowKeywordsOnNewLine
        Disallows placing keywords on a new line.

        Valid example:

        if (x < 0) {
            x++;
        } else {
            x--;
        }

        Invalid example:

        if (x < 0) {
            x++;
        }
        else {
            x--;
        }
    */
    "disallowKeywordsOnNewLine": ["else"],

    /*
        Option: requireKeywordsOnNewLine
        Requires placing keywords on a new line.

        Valid example:

        if (x < 0) {
            x++;
        }
        else {
            x--;
        }

        Invalid example:

        if (x < 0) {
            x++;
        } else {
            x--;
        }
    */
    "requireKeywordsOnNewLine": ["else"],

    /*
        Option: requireLineFeedAtFileEnd
        Requires placing line feed at file end.
    */
    "requireLineFeedAtFileEnd": true,

    /*
        Option: safeContextKeyword
        Option to check "var that = this" expressions

        Valid example:

        var that = this;

        Invalid example:

        var _this = this;
    */
    "safeContextKeyword": "that",

    /*
        Option: validateJSDoc
        Enables jsdoc validation.

        Option: validateJSDoc.checkParamNames
        Ensures param names in jsdoc and in function declaration are equal.

        Option: validateJSDoc.requireParamTypes
        Ensures params in jsdoc contains type.

        Option: validateJSDoc.checkRedundantParams
        Reports redundant params in jsdoc.
    */
    "validateJSDoc": {
        "checkParamNames": true,
        "checkRedundantParams": true,
        "requireParamTypes": true
    },

    /*
        Option: excludeFiles
        Disables style checking for specified paths.
    */
    "excludeFiles": ["node_modules/**"],

    /*
        Option: additionalRules
        Pluggable rules 
    */
    "additionalRules": ["project-rules/*.js"]
}
```

Browser Usage
-------------

File `jscs-browser.js` contains browser-compatible version of `jscs`.

Download and include `jscs-browser.js` into your page.

Example:

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
