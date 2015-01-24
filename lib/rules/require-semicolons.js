/**
 * Requires semicolon after:
 *
 * * var declaration
 * * expression statement
 * * return
 * * throw
 * * break
 * * continue
 * * do-while
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSemicolons": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1
 * ```
*/

var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSemicolons) {
        assert(
            typeof requireSemicolons === 'boolean',
            'requireSemicolons option requires boolean value'
        );
        assert(
            requireSemicolons === true,
            'requireSemicolons option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSemicolons';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        // main job
        file.iterateNodesByType([
            'VariableDeclaration',
            'ExpressionStatement',
            'DoWhileStatement',
            'ReturnStatement',
            'ThrowStatement',
            'BreakStatement',
            'ContinueStatement',
            'DebuggerStatement'
        ], function(node) {
            // ignore variable declaration inside for and for-in
            if (node.type === 'VariableDeclaration') {
                if ((node.parentNode.type === 'ForInStatement' && node.parentNode.left === node) ||
                    (node.parentNode.type === 'ForStatement' && node.parentNode.init === node)) {
                    return;
                }
            }

            // search for last token inside node
            var token;
            for (var i = file.getTokenPosByRangeStart(node.range[0]) + 1; i < tokens.length; i++) {
                if (tokens[i].range[0] >= node.range[1]) {
                    break;
                }
                token = tokens[i];
            }

            // check token is semicolon
            if (!tokenHelper.tokenIsPunctuator(token, ';')) {
                errors.add(
                    'Missing semicolon after statement',
                    (token || node).loc.end
                );
            }
        });
    }

};
