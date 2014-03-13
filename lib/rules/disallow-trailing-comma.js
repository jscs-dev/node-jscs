var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow trailing comma
 * @description
 * Disallows an extra comma following the final element of an array or object literal.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`es3`](http://jshint.com/docs/options/#es3)
 * @example <caption>Example:</caption>
 * "disallowTrailingComma": true
 * @example <caption>Valid:</caption>
 * var foo = [1, 2, 3];
 * var bar = {a: "a", b: "b"}
 * @example <caption>Invalid:</caption>
 * var foo = [1, 2, 3, ];
 * var bar = {a: "a", b: "b", }
 */
module.exports.prototype = {
    configure: function(disallowTrailingComma) {
        assert(
            typeof disallowTrailingComma === 'boolean',
            'disallowTrailingComma option requires boolean value'
        );
        assert(
            disallowTrailingComma === true,
            'disallowTrailingComma option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowTrailingComma';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.type === 'Punctuator' &&
                    (nextToken.value === '}' || nextToken.value === ']')) {
                    errors.add(
                        'Extra comma following the final element of an array or object literal',
                        token.loc.start
                    );
                }
            }
        });
    }

};
