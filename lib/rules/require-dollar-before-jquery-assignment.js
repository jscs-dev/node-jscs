/**
 * Require a $ before variable names that are jquery assignments.
 *
 * Type: `Boolean`
 *
 * Value: `true`
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
            var left;
            var varName;
            var right;

            if (type === 'VariableDeclarator') {
                left = token.id;
                varName = left.name;
                right = token.init;
            } else if (type === 'AssignmentExpression') {
                left = token.left;
                if (left.computed) {
                    return;
                }

                varName = left.name || left.property.name;
                right = token.right;
            } else {// type === 'ObjectExpression'
                var props = token.properties[0];

                if (!props) {
                    return;
                }

                left = props.key;

                if (!left.name) {
                    return;
                }

                varName = left.name;
                right = props.value;
            }

            if (varName[0] === '$') {
                return;
            }

            if (!right || right.type !== 'CallExpression') {
                return;
            }

            var nextToken = file.getTokenByRangeStart(right.callee.range[0]);
            if (nextToken.value !== '$') {
                return;
            }

            nextToken = file.getNextToken(nextToken);
            if (nextToken.value !== '(') {
                return;
            }

            while (!(nextToken.type === 'Punctuator' && nextToken.value === ')')) {
                nextToken = file.getNextToken(nextToken);
            }

            nextToken = file.getNextToken(nextToken);

            if (!nextToken || !(nextToken.type === 'Punctuator' && nextToken.value === '.')) {
                errors.add(
                    'jQuery identifiers must start with a $',
                    left.loc.start.line,
                    left.loc.start.column
                );
            }
        });
    }
};
