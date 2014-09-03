var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowGuardClause) {
        assert(
            typeof disallowGuardClause === 'boolean',
            'disallowGuardClause option requires boolean value'
        );
        assert(
            disallowGuardClause === true,
            'disallowGuardClause option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowGuardClause';
    },

    check: function(file, errors) {
        file.iterateNodesByType('IfStatement', function(node) {
            if (utils.isGuardClause(node)) {
                errors.add('Guard clause', node.loc.start);
            }
        });
    }
};
