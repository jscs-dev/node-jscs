/**
 * Requires newline before module.exports
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesBeforeExport": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 2;
 *
 * module.exports = a;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 2;
 * module.exports = a;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            value === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesBeforeExport';
    },

    check: function(file, errors) {
        file.iterateNodesByType('AssignmentExpression', function(node) {
            var left = node.left;
            if (!(
                left.object &&
                left.object.name === 'module' &&
                left.property &&
                left.property.name === 'exports')) {
                return;
            }

            var firstToken = node.firstToken;
            var prevToken = file.getPrevToken(firstToken);

            errors.assert.linesBetween({
                atLeast: 2,
                token: prevToken,
                nextToken: firstToken,
                message: 'Missing newline before export'
            });
        });
    }

};
