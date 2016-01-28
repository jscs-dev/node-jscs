/**
 * Disallow use of certain AST Node types.
 *
 * Babylon node types
 *  - [Core](https://github.com/babel/babel/blob/master/doc/ast/spec.md)
 *  - [Flow](https://github.com/babel/babel/blob/master/doc/ast/flow.md)
 *  - [JSX](https://github.com/babel/babel/blob/master/doc/ast/jsx.md)
 *
 * Type: `Array`
 *
 * Value: Array of parser node types to be disallowed.
 *
 * #### Example
 *
 * ```js
 * "disallowNodeTypes": ['LabeledStatement']
 * ```
 *
 * ##### Valid
 *
 * ```js
 * // use of an allowed node type
 * var a = 1;
 * // shorthand form of arrow function that returns an object
 * var f = () => ({ a: 1 });
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // label statement with loop
 * loop1:
 * for (i = 0; i < 10; i++) {
 *     if (i === 3) {
 *         break loop1;
 *     }
 * }
 * // accidental label statement with arrow function
 * var f = () => { a: 1 };
 * // label statement
 * { a: 1 }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(nodeTypes) {
        assert(
            Array.isArray(nodeTypes),
            'disallowNodeTypes option requires an array'
        );

        this._nodeTypes = nodeTypes;
    },

    getOptionName: function() {
        return 'disallowNodeTypes';
    },

    check: function(file, errors) {
        var disallowedNodeTypes = this._nodeTypes;
        file.iterateNodesByType(disallowedNodeTypes, function(node) {
            errors.add('Illegal use of disallowed node type: ' + node.type, node);
        });
    }
};
