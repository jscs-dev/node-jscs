var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': 'all',
            'ignoreFunction': 'ignoreFunction',
            'ignoreLineBreak': 'ignoreLineBreak',
            'skipWithFunction': 'ignoreFunction',
            'skipWithLineBreak': 'ignoreLineBreak'
        };
        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + ' requires one of the following values: ' + Object.keys(modes).join(', ')
        );
        this._mode = modes[mode];
    },

    getOptionName: function() {
        return 'requireAlignedObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            if (node.loc.start.line === node.loc.end.line || node.properties < 2) {
                return;
            }

            var maxKeyEndPos = 0;
            var skip = node.properties.some(function(property, index) {
                maxKeyEndPos = Math.max(maxKeyEndPos, property.key.loc.end.column);

                if (mode === 'ignoreFunction' && property.value.type === 'FunctionExpression') {
                    return true;
                }

                if (mode === 'ignoreLineBreak' && index > 0 &&
                     node.properties[index - 1].loc.end.line !== property.loc.start.line - 1) {
                    return true;
                }
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
