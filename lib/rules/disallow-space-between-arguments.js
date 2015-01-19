/**
 * Ensure there are no spaces after argument separators in call expressions.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBetweenArguments": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * a(b,c);
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * a(b, c);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpaceBetweenArguments) {
        assert(
            typeof disallowSpaceBetweenArguments === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallowSpaceBetweenArguments === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBetweenArguments';
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

                    if (punctuatorToken.range[1] < nextParamToken.range[0] &&
                        param.loc.start.line === nextParamToken.loc.start.line) {

                        errors.add(
                            'Unexpected space before argument ' + argumentIndex,
                            nextParamToken.loc.start
                        );
                    }
                }
            });
        });
    }

};
