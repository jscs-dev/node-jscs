/**
 * Requires member expressions to use dot notation when possible
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`sub`](http://www.jshint.com/docs/options/#sub)
 *
 * #### Example
 *
 * ```js
 * "requireDotNotation": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = b[c];
 * var a = b.c;
 * var a = b[c.d];
 * var a = b[1];
 * var a = b['while']; //reserved word
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = b['c'];
 * ```
 */

var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireDotNotation) {
        assert(
            typeof requireDotNotation === 'boolean',
            'requireDotNotation option requires boolean value'
        );
        assert(
            requireDotNotation === true,
            'requireDotNotation option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireDotNotation';
    },

    check: function(file, errors) {
        function isES3Allowed(value) {
            return file.getDialect() === 'es3' && (utils.isEs3Keyword(value) || utils.isEs3FutureReservedWord(value));
        }

        file.iterateNodesByType('MemberExpression', function(node) {
            if (!node.computed || node.property.type !== 'Literal') {
                return;
            }

            var value = node.property.value;
            if (typeof value === 'number' || (typeof value === 'string' && !utils.isValidIdentifierName(value))) {
                return;
            }

            if (value === null ||
                typeof value === 'boolean' ||
                value === 'null' ||
                value === 'true' ||
                value === 'false' ||
                isES3Allowed(value)
            ) {
                return;
            }

            errors.add(
                'Use dot notation instead of brackets for member expressions',
                node.property.loc.start
            );
        });
    }

};
