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

function checkForMember(assignment, skip, errors) {
    if (skip(assignment.left.property.name, assignment.right)) {
        return;
    }

    if (assignment.left.property.name !== assignment.right.id.name) {
        errors.add(
            'Function name does not match member name',
            assignment.loc.start
        );
    }
}

function checkForProperty(property, skip, errors) {
    if (skip(property.key.name, property.value)) {
        return;
    }

    if (property.key.name !== property.value.id.name) {
        errors.add(
            'Function name does not match property name',
            property.loc.start
        );
    }
}
