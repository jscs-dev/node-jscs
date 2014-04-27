var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow dangling underscores
 * @description
 * Disallows identifiers that start or end in `_`, except for some popular exceptions:
 *
 *  - `_` (underscore.js)
 *  - `__filename` (node.js global)
 *  - `__dirname` (node.js global)
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`nomen`](http://www.jshint.com/docs/options/#nomen)
 *
 * @example <caption>Example:</caption>
 * "disallowDanglingUnderscores": true
 * @example <caption>Valid:</caption>
 * var x = 1;
 * var y = _.extend;
 * var z = __dirname;
 * var w = __filename;
 * var x_y = 1;
 * @example <caption>Invalid:</caption>
 * var _x = 1;
 * var x_ = 1;
 * var x_y_ = 1;
 */
module.exports.prototype = {

    configure: function(disallowDanglingUnderscores) {
        assert(
            typeof disallowDanglingUnderscores === 'boolean',
            'disallowDanglingUnderscores option requires boolean value'
        );
        assert(
            disallowDanglingUnderscores === true,
            'disallowDanglingUnderscores option requires true value or should be removed'
        );

        this._allowedIdentifiers = {
            _: true,
            __dirname: true,
            __filename: true
        };
    },

    getOptionName: function() {
        return 'disallowDanglingUnderscores';
    },

    check: function(file, errors) {
        var allowedIdentifiers = this._allowedIdentifiers;

        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if ((value[0] === '_' || value.slice( -1 ) === '_') &&
                !allowedIdentifiers[value]
            ) {
                errors.add(
                    'Invalid dangling underscore found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
