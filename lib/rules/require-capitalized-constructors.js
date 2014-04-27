var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require capitalized constructors
 * @description
 * Requires constructors to be capitalized (except for `this`)
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`newcap`](http://jshint.com/docs/options/#newcap)
 *
 * @example <caption>Example:</caption>
 * "requireCapitalizedConstructors": true
 * @example <caption>Valid:</caption>
 * var a = new B();
 * var c = new this();
 * @example <caption>Invalid:</caption>
 * var d = new e();
 */
module.exports.prototype = {

    configure: function(requireCapitalizedConstructors) {
        assert(
            typeof requireCapitalizedConstructors === 'boolean',
            'requireCapitalizedConstructors option requires boolean value'
        );
        assert(
            requireCapitalizedConstructors === true,
            'requireCapitalizedConstructors option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireCapitalizedConstructors';
    },

    check: function(file, errors) {
        file.iterateNodesByType('NewExpression', function(node) {
            if (node.callee.type === 'Identifier' &&
                node.callee.name[0].toUpperCase() !== node.callee.name[0]
            ) {
                errors.add(
                    'Constructor functions should be capitalized',
                    node.callee.loc.start.line,
                    node.callee.loc.start.column
                );
            }
        });
    }

};
