/**
 * Requires a blank line after `'use strict';` statements
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesAfterUseStrict": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * 'use strict';
 *
 * // code
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * 'use strict';
 * // code
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requirePaddingNewLinesAfterUseStrict) {
        assert(
            requirePaddingNewLinesAfterUseStrict === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesAfterUseStrict';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ExpressionStatement', function(node) {
            var expression = node.expression;

            if (expression.type !== 'Literal' || expression.value !== 'use strict') {
                return;
            }

            var endOfNode = file.getLastNodeToken(node);
            var nextToken = file.getNextToken(endOfNode, {
                includeComments: true
            });

            errors.assert.linesBetween({
                atLeast: 2,
                token: endOfNode,
                nextToken: nextToken
            });
        });
    }
};
