var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpacesInsideObjectBrackets) {
        var modes = {
            'all': true,
            'all_but_nested': true
        };
        assert(
            typeof requireSpacesInsideObjectBrackets === 'string' &&
            modes[requireSpacesInsideObjectBrackets],
            'require_spaces_inside_object_brackets option requires string value \'all\' or \'all_but_nested\''
        );
    },

    getOptionName: function() {
        return 'require_spaces_inside_object_brackets';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var start = node.range[0];
            var end = node.range[1];
            console.log(node.getTokenPosByRangeStart(start));
            console.log(node.getTokenPosByRangeStart(end));
            console.log(errors + ' ');
        });
    }

};
