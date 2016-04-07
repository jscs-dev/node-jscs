/**
 * Disallows newline before opening curly brace of all block statements.
 *
 * Type: `Boolean` or `Array` or `Object`
 *
 * Values:
 *
 * - `true` always disallows newline before curly brace of block statements
 * - `Array` specifies block-type keywords after which newlines are disallowed before curly brace
 *     - Valid types include: `['if', 'else', 'try', 'catch', 'finally', 'do', 'while', 'for', 'function', 'class',
 *       'switch']`
 * - `Object`:
 *     - `value`: `true` or an Array
 *     - `allExcept`: Array of exceptions
 *        - `"multiLine"`: if the conditions span on multiple lines, require a new line before the curly brace
 *
 * #### Example
 *
 * ```js
 * "disallowNewlineBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function good(){
 *     var obj = {
 *         val: true
 *     };
 *
 *     return {
 *         data: obj
 *     };
 * }
 *
 * if (cond){
 *     foo();
 * }
 *
 * for (var e in elements){
 *     bar(e);
 * }
 *
 * while (cond){
 *     foo();
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function bad()
 * {
 *     var obj =
 *     {
 *         val: true
 *     };
 *
 *     return {
 *         data: obj
 *     };
 * }
 *
 * if (cond)
 * {
 *     foo();
 * }
 *
 * for (var e in elements)
 * {
 *     bar(e);
 * }
 *
 * while (cond)
 * {
 *     foo();
 * }
 * ```
 *
 * #### Example
 *
 * ```js
 * "disallowNewlineBeforeBlockStatements": ["if", "else", "for"]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (i > 0) {
 *     positive = true;
 * }
 *
 * if (i < 0) {
 *     negative = true;
 * } else {
 *     negative = false;
 * }
 *
 * for (var i = 0, len = myList.length; i < len; ++i) {
 *     newList.push(myList[i]);
 * }
 *
 * // this is fine, since "function" wasn't configured
 * function myFunc(x)
 * {
 *     return x + 1;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (i < 0)
 * {
 *     negative = true;
 * }
 *
 * if (i < 0)
 * {
 *     negative = true;
 * }
 * else
 * {
 *     negative = false;
 * }
 *
 * for (var i = 0, len = myList.length; i < len; ++i)
 * {
 *     newList.push(myList[i]);
 * }
 * ```
 *
 * #### Example
 *
 * ```js
 * "disallowNewlineBeforeBlockStatements": ["function", "while"]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function myFunc(x) {
 *     return x + 1;
 * }
 *
 * var z = function(x) {
 *     return x - 1;
 * }
 *
 * // this is fine, since "for" wasn't configured
 * for (var i = 0, len = myList.length; i < len; ++i)
 * {
 *     newList.push(myList[i]);
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function myFunc(x)
 * {
 *     return x + 1;
 * }
 *
 * var z = function(x)
 * {
 *     return x - 1;
 * }
 * ```
 *
 * #### Example
 *
 * ```js
 * "disallowNewlineBeforeBlockStatements": {
 *     "value": true,
 *     "allExcept": ["multiLine"]
 * }
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function myFunc(x,
 *                 y)
 * {
 *     return x + y;
 * }
 *
 * function foo() {
 *     if (bar && baz &&
 *         bat)
 *     {
 *         return true;
 *     }
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function myFunc(x,
 *                 y) {
 *     return x + y;
 * }
 *
 * function foo() {
 *     if (bar && baz &&
 *         bat) {
 *         return true;
 *     }
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        var settingValue;
        this._hasMultiLineEx = false;
        if (options.constructor === Object) {
            settingValue = options.value;
            if (options.allExcept) {
                assert(
                    Array.isArray(options.allExcept) && options.allExcept.length === 1 &&
                    options.allExcept[0] === 'multiLine',
                    'allExcept option must be an array whose values can be only `multiLine`'
                );
                this._hasMultiLineEx = true;
            }
        } else {
            settingValue = options;
        }
        assert(
            Array.isArray(settingValue) && settingValue.length || settingValue === true,
            'disallowNewlineBeforeBlockStatements option requires non-empty array value or true value'
        );

        this._setting = settingValue;
    },

    getOptionName: function() {
        return 'disallowNewlineBeforeBlockStatements';
    },

    check: function(file, errors) {
        var setting = this._setting;
        var hasMultiLineEx = this._hasMultiLineEx;

        function assertSameLine(token, nextToken) {
            errors.assert.sameLine({
                token: token,
                nextToken: nextToken,
                message: 'Newline before curly brace for block statement is disallowed'
            });
        }
        function assertDifferentLine(token, nextToken) {
            errors.assert.differentLine({
                token: token,
                nextToken: nextToken,
                message: 'Newline before curly brace for block statement is required'
            });
        }

        file.iterateNodesByType(['BlockStatement', 'ClassBody'], function(node) {
            if (isBareBlock(node)) {
                return;
            }

            if (setting === true || setting.indexOf(getBlockType(node)) !== -1) {
                var openingBrace = node.getFirstToken();
                var prevToken = openingBrace.getPreviousCodeToken();

                if (hasMultiLineEx !== true) {
                    assertSameLine(prevToken, openingBrace);
                    return;
                }

                // Check if the 'conditions' span on multiple lines.
                // The simplest way is to check if the round braces are on different lines.
                //
                // For example:
                //     // same line
                //     for (var i = 0; i < length; i++) {
                //     }
                //
                //     // different lines:
                //     for (var i = 0;
                //          i < length;
                //          i++)
                //     {
                //     }
                var parentElement = node.parentElement;
                var parentNextToken = file.getFirstNodeToken(parentElement);
                var openingRoundBrace = file.findNextToken(parentNextToken, 'Punctuator', '(');
                var closingRoundBrace = file.findPrevToken(openingBrace, 'Punctuator', ')');

                // Not always the conditions are there: to check look for the presence of round braces.
                // For example:
                //     try {
                //     } ...
                if (openingRoundBrace && closingRoundBrace &&
                        !file.isOnTheSameLine(openingRoundBrace, closingRoundBrace)) {
                    assertDifferentLine(prevToken, openingBrace);
                } else {
                    assertSameLine(prevToken, openingBrace);
                }
            }
        });

        if (setting === true || setting.indexOf('switch') !== -1) {
            file.iterateNodesByType(['SwitchStatement'], function(node) {
                var openingBrace = file.findNextToken(file.getLastNodeToken(node.discriminant), 'Punctuator', '{');
                var prevToken = file.getPrevToken(openingBrace);

                if (hasMultiLineEx !== true) {
                    assertSameLine(prevToken, openingBrace);
                    return;
                }

                var openingRoundBrace = file.findNextToken(file.getFirstNodeToken(node), 'Punctuator', '(');
                var closingRoundBrace = file.findPrevToken(openingBrace, 'Punctuator', ')');

                if (!file.isOnTheSameLine(openingRoundBrace, closingRoundBrace)) {
                    assertDifferentLine(prevToken, openingBrace);
                } else {
                    assertSameLine(prevToken, openingBrace);
                }
            });
        }
    }
};

function isBareBlock(node) {
    var parentElement = node.parentElement;

    return parentElement &&
    parentElement.type === 'BlockStatement' ||
    parentElement.type === 'Program' ||
    parentElement.body && parentElement.body.type === 'BlockStatement' && Array.isArray(parentElement.body);
}

function getBlockType(node) {
    var parentElement = node.parentElement;
    switch (parentElement.type) {
        case 'IfStatement':
            return (parentElement.alternate === node) ? 'else' : 'if';
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            return 'function';
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
            return 'for';
        case 'WhileStatement':
            return 'while';
        case 'DoWhileStatement':
            return 'do';
        case 'TryStatement':
            return (parentElement.finalizer === node) ? 'finally' : 'try';
        case 'CatchClause':
            return 'catch';
        case 'ClassDeclaration':
            return 'class';
    }
}
