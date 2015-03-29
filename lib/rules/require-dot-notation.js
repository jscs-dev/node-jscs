/**
 * Requires member expressions to use dot notation when possible
 *
 * Types: `Boolean` or `String`
 *
 * Values:
 *  - `true`
 *  - `"except_snake_case"` allow quoted snake cased identifiers
 *
 * JSHint: [`sub`](http://www.jshint.com/docs/options/#sub)
 *
 * #### Example
 *
 * ```js
 * "requireDotNotation": true
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * var a = b[c];
 * var a = b.c;
 * var a = b[c.d];
 * var a = b[1];
 * var a = b['while']; //reserved word
 * ```
 *
 * ##### Valid for `"except_snake_case"`
 * ```
 * var a = b[c];
 * var a = b.c;
 * var a = b['snake_cased'];
 * var a = b['camelCased_butWithSnakes'];
 * ```
 *
 * ##### Invalid for `true`
 *
 * ```js
 * var a = b['c'];
 * var a = b['snake_cased'];
 * var a = b['_camelCased'];
 * var a = b['camelCased_'];
 * ```
 *
 * ##### Invalid for `"except_snake_case"`
 *
 * ```js
 * var a = b['c'];
 * ```
 *
 * #### Example for `"es3": false` or `"es3": null`
 *
 * ```js
 * "requireDotNotation": true,
 * "es3": false
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = b[c];
 * var a = b.c;
 * var a = b[c.d];
 * var a = b[1];
 * var a = b.while;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = b['c'];
 * var a = b['while']; // reserved words can be property names in ES5
 * ```
 */

var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true || options === 'except_snake_case',
            this.getOptionName() + ' option requires a true value or "except_snake_case"'
        );
        this._exceptSnakeCase = options === 'except_snake_case';
    },

    getOptionName: function() {
        return 'requireDotNotation';
    },

    check: function(file, errors) {
        var exceptSnakeCase = this._exceptSnakeCase;

        function isES3Allowed(value) {
            return file.getDialect() === 'es3' && (utils.isEs3Keyword(value) || utils.isEs3FutureReservedWord(value));
        }

        file.iterateNodesByType('MemberExpression', function(node) {
            if (!node.computed || node.property.type !== 'Literal') {
                return;
            }

            var value = node.property.value;
            if (typeof value === 'number' || (typeof value === 'string' && (
                !utils.isValidIdentifierName(value) ||
                exceptSnakeCase && utils.isSnakeCased(utils.trimUnderscores(value))
            ))) {
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
