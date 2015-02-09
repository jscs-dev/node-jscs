/**
 * Requires space before and/or after `?` or `:` in conditional expressions.
 *
 * Type: `Object` or `Boolean`
 *
 * Values: `"afterTest"`, `"beforeConsequent"`, `"afterConsequent"`, `"beforeAlternate"` as child properties,
 * or `true` to set all properties to `true`. Child properties must be set to `true`.
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInConditionalExpression": {
 *     "afterTest": true,
 *     "beforeConsequent": true,
 *     "afterConsequent": true,
 *     "beforeAlternate": true
 * }
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = b ? c : d;
 * var a= b ? c : d;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = b? c : d;
 * var a = b ?c : d;
 * var a = b ? c: d;
 * var a = b ? c :d;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        var validProperties = [
            'afterTest',
            'beforeConsequent',
            'afterConsequent',
            'beforeAlternate'
        ];
        var optionName = this.getOptionName();

        if (options === true) {
            options = {
                'afterTest': true,
                'beforeConsequent': true,
                'afterConsequent': true,
                'beforeAlternate': true
            };
        }

        assert(
            typeof options === 'object',
            optionName + ' option must be an object or boolean true'
        );

        var isProperlyConfigured = validProperties.some(function(key) {
            var isPresent = key in options;

            if (isPresent) {
                assert(
                    options[key] === true,
                    optionName + '.' + key + ' property requires true value or should be removed'
                );
            }

            return isPresent;
        });

        assert(
            isProperlyConfigured,
            optionName + ' must have at least 1 of the following properties: ' + validProperties.join(', ')
        );

        validProperties.forEach(function(property) {
            this['_' + property] = Boolean(options[property]);
        }.bind(this));
    },

    getOptionName: function() {
        return 'requireSpacesInConditionalExpression';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['ConditionalExpression'], function(node) {
            var test = node.test;
            var consequent = node.consequent;
            var alternate = node.alternate;
            var consequentToken = file.getFirstNodeToken(consequent);
            var alternateToken = file.getFirstNodeToken(alternate);
            var questionMarkToken = file.findPrevOperatorToken(consequentToken, '?');
            var colonToken = file.findPrevOperatorToken(alternateToken, ':');
            var token;

            if (this._afterTest) {
                token = file.getPrevToken(questionMarkToken);
                if (token.loc.end.column === questionMarkToken.loc.start.column) {
                    errors.add(
                        'Missing space after test',
                        test.loc.end
                    );
                }
            }

            if (this._beforeConsequent) {
                token = file.getNextToken(questionMarkToken);
                if (token.loc.start.column === questionMarkToken.loc.end.column) {
                    errors.add(
                        'Missing space before consequent',
                        consequent.loc.start
                    );
                }
            }

            if (this._afterConsequent) {
                token = file.getPrevToken(colonToken);
                if (token.loc.end.column === colonToken.loc.start.column) {
                    errors.add(
                        'Missing space after consequent',
                        consequent.loc.end
                    );
                }
            }

            if (this._beforeAlternate) {
                token = file.getNextToken(colonToken);
                if (token.loc.start.column === colonToken.loc.end.column) {
                    errors.add(
                        'Missing space before alternate',
                        alternate.loc.start
                    );
                }
            }
        }.bind(this));
    }

};
