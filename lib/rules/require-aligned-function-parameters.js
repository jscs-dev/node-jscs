/**
 * Requires proper alignment of function parameters.
 *
 * Type: `Object` or `Boolean`
 *
 * Values: `"lineBreakAfterOpeningBraces"`, `"lineBreakBeforeClosingBraces"` as child properties or `true`.
 *
 * #### Example
 *
 * ```js
 * "requireAlignedFunctionParameters": {
 *   lineBreakAfterOpeningBraces: true,
 *   lineBreakBeforeClosingBraces: true
 * }
 * ```
 *
 * ##### Valid
 * ```js
 * function (
 *   thisIs,
 *   theLongestList,
 *   ofParametersEverWritten
 * ) {}
 * ```
 * ##### Invalid
 * ```js
 * function (thisIs,
 *           theLongestList,
 *           ofParametersEverWritten) {}
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var validProperties = [
            'lineBreakAfterOpeningBrace',
            'lineBreakBeforeClosingBrace'
        ];
        var optionName = this.getOptionName();

        assert(
            typeof options === 'object' || options === true,
            optionName + ' option must be an object or boolean true'
        );

        if (typeof options === 'object') {
            validProperties.forEach(function(key) {
                var isPresent = key in options;

                if (isPresent) {
                    assert(
                        options[key] === true,
                        optionName + '.' + key + ' property requires true value or should be removed'
                    );
                }
            });

            validProperties.forEach(function(property) {
                this['_' + property] = Boolean(options[property]);
            }.bind(this));
        }
    },

    getOptionName: function() {
        return 'requireAlignedFunctionParameters';
    },

    check: function(file, errors) {
        var lineBreakAfterOpeningBrace = this._lineBreakAfterOpeningBrace;
        var lineBreakBeforeClosingBrace = this._lineBreakBeforeClosingBrace;

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            // ignore if the parameters are not multi-line
            // or if there are no parameters at all
            var isNotMultiLine = (node.loc.start.line === node.loc.end.line);
            var hasNoParameters = !(node.params && node.params.length > 0);
            if (hasNoParameters || isNotMultiLine) {
                return;
            }

            // Look for the furthest parameter start position
            var maxParamStartPos = 0;
            node.params.forEach(function(parameter) {
                maxParamStartPos = Math.max(maxParamStartPos, parameter.loc.start.column);
            });

            // make sure all parameters are lined up
            node.params.forEach(function(parameter) {
                if (parameter.loc.start.column !== maxParamStartPos) {
                    errors.add('Multi-line parameters are not aligned.', parameter.loc.start);
                }
            });

            // Make sure the first parameter is on a new line
            if (lineBreakAfterOpeningBrace) {
                var firstParameterLine = node.params[0].loc.start.line;
                if (node.loc.start.line === firstParameterLine) {
                    errors.add('There is no line break after the opening brace.', node.loc.start);
                }
            }

            // Make sure the closing brace is on a new line
            if (lineBreakBeforeClosingBrace) {
                var lastParameter = node.params[node.params.length - 1];
                var lastParameterLine = lastParameter.loc.start.line;
                var bodyToken = file.getFirstNodeToken(node.body);
                var closingBrace = file.getPrevToken(bodyToken);
                if (closingBrace.loc.start.line === lastParameterLine) {
                    errors.add('There is no line break after the closing brace.', closingBrace.loc.start);
                }
            }

        });
    }

};
