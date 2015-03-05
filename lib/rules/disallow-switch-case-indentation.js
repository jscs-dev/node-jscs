/**
 * Requires `case` statements to begin at the same "column" as their
 * corresponding `switch` block.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSwitchCaseIndentation": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * switch (x) {
 * case "a":
 *     break;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * switch (x) {
 *     case "a":
 *         break;
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSwitchCaseIndentation) {
        assert(
            disallowSwitchCaseIndentation === true,
            'disallowSwitchCaseIndentation should be `true` or not set'
        );
    },

    getOptionName: function() {
        return 'disallowSwitchCaseIndentation';
    },

    check: function(file, errors) {
        file.iterateNodesByType('SwitchStatement', function(currentNode, index, nodes) {
            var startSwitch = file.getFirstNodeToken(currentNode);
            var endSwitch = file.getLastNodeToken(currentNode);

            var tokens = file.getTokens().slice(0);

            // We only care about the case tokens at the current switch level, since the user
            // could potentially have nested switches and the next loop iteration(s) will deal
            // with them separately

            nodes
                .filter(function(otherNodes) {
                    return otherNodes !== currentNode;
                })
                .forEach(function(other) {
                    // To accomplish this, we splice out the token ranges of
                    // all other switch nodes
                    var startOther = file.getFirstNodeToken(other);
                    var endOther = file.getLastNodeToken(other);

                    tokens.splice(tokens.indexOf(startOther), tokens.indexOf(endOther));
                });

            // Now that the token array is pared down, we grab only the range of the current switch
            // and get to steppin'
            tokens
                .slice(tokens.indexOf(startSwitch), tokens.indexOf(endSwitch))
                .filter(function(token) {
                    return token.type === 'Keyword' && token.value === 'case';
                })
                .forEach(function(token) {
                    // ignores the *unlikely* single line edge case
                    if (token.loc.start.line !== startSwitch.loc.start.line) {
                        errors.assert.indentation({
                            lineNumber: token.loc.start.line,
                            actual: token.loc.start.column,
                            expected: startSwitch.loc.start.column
                        });
                    }
                });
        });
    }
};
