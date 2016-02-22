/**
 * Requires newline before single if statements
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireNewlineBeforeSingleStatementsInIf": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (x)
 *    doX();
 * else
 *    doY();
 *
 * if (x)
 *    doX();
 * else if (v)
 *    doV();
 * else
 *    doY();
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (x) doX();
 * else doY();
 *
 * if (x) doX();
 * else if (v) doV();
 * else doY();
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            value === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireNewlineBeforeSingleStatementsInIf';
    },

    check: function(file, errors) {
        function isExpressionStatement(entity) {
            return entity.type === 'ExpressionStatement';
        }

        function assertDifferentLine(token, nextToken) {
            errors.assert.differentLine({
              token: token,
              nextToken: nextToken,
              message: 'Newline before single statement in if is required'
            });
        }

        // Recursively locate a token based on it's type.
        function getToken(entity, tokenType, tokenProperty) {
            if (entity.type === tokenType || !entity[tokenProperty]) {
                return entity;
            } else {
                return getToken(entity[tokenProperty], tokenType, tokenProperty);
            }
        }

        file.iterateNodesByType('IfStatement', function(node) {
            var consequentNode = node.consequent;
            var alternateNode = node.alternate;

            if (isExpressionStatement(consequentNode)) {
                assertDifferentLine(consequentNode, getToken(consequentNode, 'Keyword', 'previousSibling'));
            }

            if (isExpressionStatement(alternateNode)) {
                assertDifferentLine(alternateNode, getToken(alternateNode, 'Keyword', 'previousSibling'));
            }
        });
    }
};
