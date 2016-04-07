/**
 * Requires space after opening object curly brace and before closing in import statements.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInsideImportedObjectBraces": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * import { foo, bar } from 'foo-bar';
 *
 * import { foo as f, bar } from 'foo-bar';
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * import {foo, bar} from 'foo-bar';
 *
 * import {foo as f, bar} from 'foo-bar';
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpacesInsideImportedObjectBraces';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['ImportDeclaration'], function(node) {

            if (!node.specifiers) {
                return;
            }

            node.specifiers.forEach(function(specifier) {

                if (specifier.type !== 'ImportSpecifier') {
                    return;
                }

                var maybeOpeningBrace = file.getPrevToken(specifier.getFirstToken());
                var maybeClosingBrace = file.getNextToken(specifier.getLastToken());

                if (maybeOpeningBrace.value === '{') {
                    errors.assert.spacesBetween({
                        token: maybeOpeningBrace,
                        nextToken: specifier.getFirstToken(),
                        exactly: 1,
                        message: 'One space required after opening curly brace'
                    });
                }

                if (maybeClosingBrace.value === '}') {
                    errors.assert.spacesBetween({
                        token: specifier.getLastToken(),
                        nextToken: maybeClosingBrace,
                        exactly: 1,
                        message: 'One space required before closing curly brace'
                    });
                }
            });
        });
    }
};
