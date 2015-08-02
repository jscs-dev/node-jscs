/**
 * Requires function names to match member and property names.
 *
 * It doesn't affect anonymous functions nor functions assigned to members or
 * properties named with a reserved word.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireMatchingFunctionName": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var test = {};
 * test.foo = function foo() {};
 * ```
 *
 * ```js
 * var test = {};
 * test['foo'] = function foo() {};
 * ```
 *
 * ```js
 * var test = {foo: function foo() {}};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var test = {};
 * test.foo = function bar() {};
 * ```
 *
 * ```js
 * var test = {};
 * test['foo'] = function bar() {};
 * ```
 *
 * ```js
 * var test = {foo: function bar() {}};
 * ```
 */

var assert = require('assert');
var reservedWords = require('reserved-words');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMatchingFunctionName) {
        assert(
            requireMatchingFunctionName === true,
            'requireMatchingFunctionName option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireMatchingFunctionName';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionExpression'], function(node) {
            switch (node.parentNode.type) {
                // var foo = function bar() {}
                // object.foo = function bar() {}
                // object['foo'] = function bar() {}
                case 'AssignmentExpression':
                    checkForMember(node.parentNode, skip, errors);
                    break;

                // object = {foo: function bar() {}}
                case 'Property':
                    checkForProperty(node.parentNode, skip, errors);
                    break;
            }
        });

        function skip(key, value) {
            // We don't care about anonymous functions as
            // those should be enforced by separate rule
            if (!value.id) {
                return true;
            }

            // Relax a bit when reserved word is detected
            if (reservedWords.check(key, file.getDialect(), true)) {
                return true;
            }
        }
    }
};

/**
 * Fetching name from a Pattern
 *
 * @param {Pattern} pattern - E.g. left side of AssignmentExpression
 * @returns {String|Boolean} - Resolved name or false (if there is an Expression)
 */
function _resolvePatternName(pattern) {
    switch (pattern.type) {
        case 'Identifier':
            // prop = ...;
            return pattern.name;
        case 'Literal':
            // obj['prop'] = ...;
            return pattern.value;
        case 'MemberExpression':
            // obj.prop = ...;
            return _resolvePatternName(pattern.property);
        default:
            // Something unhandy like obj['x' + 2] = ...;
            return false;
    }
}

function checkForMember(assignment, skip, errors) {
    var _name = _resolvePatternName(assignment.left);
    if (_name === false || skip(_name, assignment.right)) {
        return;
    }

    if (_name !== assignment.right.id.name) {
        errors.add(
            'Function name does not match member name',
            assignment.loc.start
        );
    }
}

function checkForProperty(property, skip, errors) {
    var _name = _resolvePatternName(property.key);
    if (_name === false || skip(_name, property.value)) {
        return;
    }

    if (_name !== property.value.id.name) {
        errors.add(
            'Function name does not match property name',
            property.loc.start
        );
    }
}
