/**
 * Disallows space before block statements (for loops, control structures).
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (cond){
 *     foo();
 * }
 *
 * for (var e in elements){
 *     bar(e);
 * }
 *
 * while (cond){
 *     foo();
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (cond) {
 *     foo();
 * }
 *
 * for (var e in elements) {
 *     bar(e);
 * }
 *
 * while (cond) {
 *     foo();
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSpaceBeforeBlockStatements) {
        assert(
            typeof disallowSpaceBeforeBlockStatements === 'boolean',
            'disallowSpaceBeforeBlockStatements option requires boolean value'
        );
        assert(
            disallowSpaceBeforeBlockStatements === true,
            'disallowSpaceBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType('BlockStatement', function(node) {
            var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.range[0] - 1);
            var tokenBeforeBody = tokens[tokenBeforeBodyPos];
            if (!tokenBeforeBody) {
                errors.add(
                    'Extra space before opening curly brace for block expressions',
                    node.loc.start
                );
            }
        });
    }

};
