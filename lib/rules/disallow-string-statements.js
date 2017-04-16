/**
 * Disallows string literal statements.
 *
 * Type: `Boolean`
 *
 * Values: true
 *
 * #### Example
 *
 * ```js
 * "disallowStringLiteralStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * 'use strict';
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * 'use-strict';
 * 'just a string';
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowStringLiteralStatements) {
        assert(disallowStringLiteralStatements, 'disallowStringLiteralStatements option requires true value');
    },

    getOptionName: function() {
        return 'disallowStringLiteralStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ExpressionStatement', function(node) {
            var expr = node.expression;
            if (expr.type === 'Literal' && typeof expr.value === 'string' && expr.value !== 'use strict') {
                errors.add('Only \'use strict\' literal statement is allowed', node.loc.start);
            }
        });
    }

};
