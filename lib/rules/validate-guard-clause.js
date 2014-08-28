var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(typeof options === 'object', 'validateGuardClause option requires object value');

        if (options.requireCurlyBraces) {
            assert(
                typeof options.requireCurlyBraces === 'boolean',
                'validateGuardClause.requireCurlyBraces option requires boolean value'
            );
            assert(
                options.requireCurlyBraces === true,
                'validateGuardClause.requireCurlyBraces option requires true value or should be removed'
            );
        }

        if (options.disallowCurlyBraces) {
            assert(
                typeof options.disallowCurlyBraces === 'boolean',
                'validateGuardClause.disallowCurlyBraces option requires boolean value'
            );
            assert(
                options.disallowCurlyBraces === true,
                'validateGuardClause.disallowCurlyBraces option requires true value or should be removed'
            );
        }

        if (options.requireInOneLine) {
            assert(
                typeof options.requireInOneLine === 'boolean',
                'validateGuardClause.requireInOneLine option requires boolean value'
            );
            assert(
                options.requireInOneLine === true,
                'validateGuardClause.requireInOneLine option requires true value or should be removed'
            );
        }

        if (options.disallowInOneLine) {
            assert(
                typeof options.disallowInOneLine === 'boolean',
                'validateGuardClause.disallowInOneLine option requires boolean value'
            );
            assert(
                options.disallowInOneLine === true,
                'validateGuardClause.disallowInOneLine option requires true value or should be removed'
            );
        }

        this._options = options;
    },

    getOptionName: function() {
        return 'validateGuardClause';
    },

    check: function(file, errors) {
        var requireCurlyBraces = this._options.requireCurlyBraces;
        var disallowCurlyBraces = this._options.disallowCurlyBraces;
        var requireInOneLine = this._options.requireInOneLine;
        var disallowInOneLine = this._options.disallowInOneLine;

        file.iterateNodesByType('IfStatement', function(node) {
            if (!utils.isGuardClause(node)) {
                return;
            }

            if (requireCurlyBraces && node.consequent.type !== 'BlockStatement') {
                errors.add('Guard clause must use curly braces', node.consequent.loc.start);
            }
            if (disallowCurlyBraces && node.consequent.type === 'BlockStatement') {
                errors.add('Guard clause must not use curly braces', node.consequent.loc.start);
            }

            if (requireInOneLine &&
                node.loc.start.line !== node.consequent.loc.end.line) {
                errors.add('Guard clause must be written in one line', node.loc.start);
            }
            if (disallowInOneLine &&
                node.loc.start.line === node.consequent.loc.end.line) {
                errors.add('Guard clause must not be written in one line', node.loc.start);
            }
        });
    }
};
