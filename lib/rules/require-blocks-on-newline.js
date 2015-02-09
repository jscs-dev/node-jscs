/**
 * Requires blocks to begin and end with a newline
 *
 * Type: `Boolean` or `Integer`
 *
 * Values: `true` validates all non-empty blocks,
 * `Integer` specifies a minimum number of statements in the block before validating.
 *
 * #### Example
 *
 * ```js
 * "requireBlocksOnNewline": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * if (true) {
 *     doSomething();
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) {doSomething();}
 * ```
 *
 * ##### Valid for mode `1`
 *
 * ```js
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) { doSomething(); doSomethingElse(); }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireBlocksOnNewline) {
        assert(
            requireBlocksOnNewline === true || typeof requireBlocksOnNewline === 'number',
            'requireBlocksOnNewline option requires the value true or an Integer'
        );

        this._minStatements = requireBlocksOnNewline === true ? 0 : requireBlocksOnNewline;
    },

    getOptionName: function() {
        return 'requireBlocksOnNewline';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;

        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length <= minStatements) {
                return;
            }

            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getNextToken(openingBracket);

            if (openingBracket.loc.start.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getPrevToken(closingBracket);

            if (closingBracket.loc.start.line === prevToken.loc.start.line) {
                errors.add('Missing newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};
