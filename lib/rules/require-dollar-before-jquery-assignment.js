/**
 * Require a $ before variable names that are jquery assignments.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 *
 * #### Example
 *
 * ```js
 * "requireDollarBeforejQueryAssignment": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var $x = $(".foo");
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = $(".foo");
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireDollarBeforejQueryAssignment) {
        assert(
            requireDollarBeforejQueryAssignment === true,
            'requireDollarBeforejQueryAssignment option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireDollarBeforejQueryAssignment';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['VariableDeclarator', 'AssignmentExpression', 'ObjectExpression'], function(token) {
            var type = token.type;
            var varName;
            var right;

            if (type === 'VariableDeclarator') {
                varName = token.id.name;
                right = token.init;
            } else if (type === 'AssignmentExpression') {
                varName = token.left.name || token.left.property.name;
                right = token.right;
            } else if (type === 'ObjectExpression') {
                var props = token.properties[0];
                varName = props.key.name;
                right = props.value;
            }

            if (varName[0] === '$') {
                return;
            }

            if (right.type === 'ObjectExpression') {
                return;
            }

            var nextToken = file.getTokenByRangeStart(right.callee.range[0]);
            if (nextToken.value !== '$') {
                return;
            }

            nextToken = file.getNextToken(nextToken);
            if (nextToken.type !== 'Punctuator' && nextToken.value !== '(') {
                return;
            }

            nextToken = file.getNextToken(nextToken);

            if (!(nextToken.type === 'Punctuator' && nextToken.value === ')')) {
                nextToken = file.getNextToken(nextToken);
            }

            nextToken = file.getNextToken(nextToken);

            var isChain = nextToken.type === 'Punctuator' && nextToken.value === '.';

            if (!nextToken || !isChain) {
                errors.add(
                    'jQuery identifiers must start with a $',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }
};
