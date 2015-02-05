/**
 * Disallows newline before opening curly brace of all block statements.
 *
 * Type: `Boolean` or `Array`
 *
 * Values:
 *
 * - `true` always disallows newline before curly brace of block statements
 * - `Array` specifies block-type keywords after which newlines are disallowed before curly brace
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
 */

var assert = require('assert');

var allowedKeywords = ['if', 'else', 'try', 'catch', 'finally', 'do', 'while', 'for', 'function'];

module.exports = function() {};

module.exports.prototype = {
    configure: function(settingValue) {
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
        if (this._setting === true) {
            checkAll(file, errors);
        } else {
            checkSpecificTypes(file, errors, this._setting);
        }
    }
};

function checkAll(file, errors) {
    file.iterateNodesByType('BlockStatement', function(node) {
        var openingBrace = file.getFirstNodeToken(node);
        var prevToken = file.getPrevToken(openingBrace);

        errors.assert.sameLine({
            token: prevToken,
            nextToken: openingBrace,
            message: 'Newline before curly brace for block statement is disallowed'
        });
    });
}

function checkSpecificTypes(file, errors, types) {
    file.iterateNodesByType(['BlockStatement'], function(node) {
        var type = getBlockType(node);
        if (types.indexOf(type) !== -1) {
            var openingBrace = file.getFirstNodeToken(node);
            var prevToken = file.getPrevToken(openingBrace);

            errors.assert.sameLine({
                token: prevToken,
                nextToken: openingBrace,
                message: 'Newline before curly brace for "' + type + '" block statement is disallowed'
            });
        }
    });
}

function getBlockType(node) {
    var parentType = node.parentNode.type;
    var blockType;
    switch (parentType) {
        case 'IfStatement':
            if (node.parentNode.alternate === node) {
                blockType = 'else';
            } else {
                blockType = 'if';
            }
            break;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
            blockType = 'function';
            break;
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
            blockType = 'for';
            break;
        case 'WhileStatement':
            blockType = 'while';
            break;
        case 'DoWhileStatement':
            blockType = 'do';
            break;
        case 'TryStatement':
            if (node.parentNode.finalizer === node) {
                blockType = 'finally';
            } else {
                blockType = 'try';
            }
            break;
        case 'CatchClause':
            blockType = 'catch';
            break;
        default:
            blockType = 'other';
            break;
    }
    return blockType;
}
