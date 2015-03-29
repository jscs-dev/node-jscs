/**
 * Disallows empty blocks (except for catch blocks).
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * JSHint: [`noempty`](http://jshint.com/docs/options/#noempty)
 *
 * #### Example
 *
 * ```js
 * "disallowEmptyBlocks": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if ( a == b ) { c = d; }
 * try { a = b; } catch( e ){}
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if ( a == b ) { } else { c = d; }
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
        return 'disallowEmptyBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length === 0 &&
                node.parentNode.type !== 'CatchClause' &&
                node.parentNode.type !== 'FunctionDeclaration' &&
                node.parentNode.type !== 'FunctionExpression') {
                errors.add('Empty block found', node.loc.end);
            }
        });
    }

};
