var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow empty blocks
 * @description
 * Disallows empty blocks (except for catch blocks).
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [noempty](http://jshint.com/docs/options/#noempty)
 *
 * @example <caption>Example:</caption>
 * "disallowEmptyBlocks": true
 * @example <caption>Valid:</caption>
 * if ( a == b ) { c = d; }
 * try { a = b; } catch( e ){}
 * @example <caption>Invalid:</caption>
 * if ( a == b ) { } else { c = d; }
 */
module.exports.prototype = {

    configure: function(disallowEmptyBlocks) {
        assert(
            typeof disallowEmptyBlocks === 'boolean',
            'disallowEmptyBlocks option requires boolean value'
        );
        assert(
            disallowEmptyBlocks === true,
            'disallowEmptyBlocks option requires true value or should be removed'
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
