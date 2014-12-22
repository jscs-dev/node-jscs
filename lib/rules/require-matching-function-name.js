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
var utils = require('../../lib/utils');

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
                    checkForMember(node.parentNode, errors);
                    break;

                // object = {foo: function bar() {}}
                case 'Property':
                    checkForProperty(node.parentNode, errors);
                    break;
            }
        });
    }
};

function checkForMember(assignment, errors) {
    // We don't care about anonymous functions as
    // those should be enforced by separate rule
    if (isAnonymousFunction(assignment.right)) {
        return;
    }

    // Relax a bit when reserved word is detected
    if (isReservedName(assignment.left.property.name)) {
        return;
    }

    if (assignment.left.property.name !== assignment.right.id.name) {
        errors.add(
            'Function name does not match member name',
            assignment.loc.start
        );
    }
}

function checkForProperty(property, errors) {
    // We don't care about anonymous functions as
    // those should be enforced by separate rule
    if (isAnonymousFunction(property.value)) {
        return;
    }

    // Relax a bit when reserved word is detected
    if (isReservedName(property.key.name)) {
        return;
    }

    if (property.key.name !== property.value.id.name) {
        errors.add(
            'Function name does not match property name',
            property.loc.start
        );
    }
}

function isAnonymousFunction(node) {
    return !node.id;
}

function isReservedName(name) {
    return utils.isEs3Keyword(name) || utils.isEs3FutureReservedWord(name);
}
