/**
 * Ensure there are spaces after argument separators in call expressions.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBetweenArguments": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * a(b, c);
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * a(b,c);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceBetweenArguments) {
        assert(
            typeof requireSpaceBetweenArguments === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            requireSpaceBetweenArguments === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpaceBetweenArguments';
    },

    check: function(file, errors) {

        var tokens = file.getTokens();

        file.iterateNodesByType(['CallExpression'], function(node) {

            node.arguments.forEach(function(param, i) {

                var paramTokenPos = file.getTokenPosByRangeStart(param.range[0]);
                var punctuatorToken = tokens[paramTokenPos + 1];
                var argumentIndex = i + 1;

                if (punctuatorToken.value === ',') {

                    var nextParamToken = tokens[paramTokenPos + 2];

                    if (punctuatorToken.range[1] === nextParamToken.range[0]) {
                        errors.add(
                            'Missing space before argument ' + argumentIndex,
                            nextParamToken.loc.start
                        );
                    }
                }
            });
        });
    }

};
