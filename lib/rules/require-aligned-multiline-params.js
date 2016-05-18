/**
 * Enforces indentation of parameters in multiline functions
 *
 * Types: `Boolean`, `String`, `Number`
 *
 * Values:
 *  - `true` to require parameters are aligned with the body of the function
 *  - `'firstParam'` to require parameters to be aligned with the first parameter
 *  - `Number` for the number of columns the parameters should be indented past the function body
 *
 * #### Example
 *
 * ```js
 * "requireAlignedMultilineParams": true
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * var test = function(one, two,
 *   three, four, five,
 *   six, seven, eight) {
 *   console.log(a);
 * };
 * ```
 *
 * ##### Valid for `2`
 *
 * ```js
 * var test = function(one, two,
 *     three, four, five,
 *     six, seven, eight) {
 *   console.log(a);
 * };
 * ```
 *
 * ##### Valid for `'firstParam'`
 *
 * ```js
 * var test = function(one, two,
 *                     three, four, five,
 *                     six, seven, eight) {
 *   console.log(a);
 * };
 * ```
 *
 * ##### Invalid for `0`
 *
 * ```js
 * var test = function(one, two,
 *     three, four, five,
 *     six, seven, eight) {
 *   console.log(a);
 * };
 * ```
 *
 */

var assert = require('assert');

function getNodeColumn(node) {
    var currentToken = node.getFirstToken().getPreviousToken();
    var indentationLevel = 0;
    while (currentToken) {
        if (currentToken.getNewlineCount() > 0) {
            var sourceCodeLines = currentToken.getSourceCodeLines();
            indentationLevel += sourceCodeLines[sourceCodeLines.length - 1].length;
            break;
        }

        indentationLevel += currentToken.getSourceCodeLength();

        currentToken = currentToken.getPreviousToken();
    }
    return indentationLevel;
}

module.exports = function() {
};

module.exports.prototype = {

    configure: function(option) {
        if (typeof option === 'number') {
            this._indentationLevel = option;
        } else if (typeof option === 'string') {
            assert(
                option === 'firstParam',
                this.getOptionName() + ' option requires string value to be "firstParam"'
            );

            this._alignWithFirstParam = true;
        } else if (option === true) {
            this._indentationLevel = 0;
        } else {
            assert(
                false,
                this.getOptionName() + ' option requires a valid option'
            );
        }
    },

    getOptionName: function() {
        return 'requireAlignedMultilineParams';
    },

    check: function(file, errors) {
        var _this = this;
        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var params = node.params;

            // We can pass the check if there's no params
            if (params.length === 0) {
                return;
            }

            var firstParam = params[0];
            var referenceColumn;
            var body;

            if (_this._alignWithFirstParam) {
                referenceColumn = getNodeColumn(firstParam);
            } else {

                body = node.body.body[0];

                // If function doesn't have a body just bail out (#1988)
                if (!body) {
                    return;
                }

                referenceColumn = body.getLoc().start.column + _this._indentationLevel;
            }

            var previousParam = firstParam;
            params.slice(1).forEach(function(param) {
                if (!file.isOnTheSameLine(previousParam, param)) {
                    var paramColumn = getNodeColumn(param);
                    if (paramColumn !== referenceColumn) {
                        errors.assert.indentation({
                            token: param.getFirstToken(),
                            actual: paramColumn,
                            expected: referenceColumn,
                            indentChar: ' '
                        });
                    }

                    previousParam = param;
                }
            });

        });
    }

};
