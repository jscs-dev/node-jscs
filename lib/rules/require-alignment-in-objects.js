var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'skip_with_function': true,
            'skip_with_line_break': true
        };
        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + ' option requires string value \'skip_with_function\' or \'skip_with_line_break\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'require_alignment_in_objects';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            if (node.loc.start.line === node.loc.end.line || node.properties < 2) {
                return;
            }

            var skip = false;
            var maxKeyEndPos = 0;

            node.properties.forEach(function(property, index) {
                var keyEndPos = property.key.loc.end.column;
                if (keyEndPos > maxKeyEndPos) {
                    maxKeyEndPos = keyEndPos;
                }
                skip = skip || (mode === 'skip_with_function' && property.value.type === 'FunctionExpression') ||
                    (mode === 'skip_with_line_break' && index > 0 &&
                     node.properties[index - 1].loc.end.line !== property.loc.start.line - 1);
            });

            if (skip) {
                return;
            }
            
            node.properties.forEach(function(property) {
                var keyPos = file.getTokenPosByRangeStart(property.key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.loc.start.column !== maxKeyEndPos + 1) {
                    errors.add('Alignment required', colon.loc.start);
                }
            });
        });
    }

};
