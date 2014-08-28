var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(config) {

        this._tabSize = 1;

        if (typeof config === 'object') {

            this.configureMode(config.mode, true);
            this.configureTabSize(config.tabSize);

        } else {
            this.configureMode(config);
        }
    },

    configureTabSize: function(tabSize) {

        if (tabSize) {
            this._tabSize = tabSize;
        }

    },

    configureMode: function(mode, isProperty) {

        var modes = {
            'all': 'all',
            'ignoreFunction': 'ignoreFunction',
            'ignoreLineBreak': 'ignoreLineBreak',
            'skipWithFunction': 'ignoreFunction',
            'skipWithLineBreak': 'ignoreLineBreak'
        };

        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + (isProperty ? '.mode' : '') + ' requires one of the following values: ' + Object.keys(modes).join(', ')
        );

        this._mode = modes[mode];
    },

    getOptionName: function() {
        return 'requireAlignedObjectValues';
    },

    _getColonPosition: function(file, property) {

        var tabSize = this._tabSize;
        var keyPos = file.getTokenPosByRangeStart(property.key.range[0]);
        var colon = file.getTokens()[keyPos + 1];
        var line = (file.getLines()[colon.loc.start.line-1]);
        var colonPosition = tokenHelper.getTabAdjustedStartPosition(colon, line, tabSize);

        return {
            pos: colonPosition,
            colon: colon
        };
    },

    check: function(file, errors) {

        var mode = this._mode;
        var getColonPosition = this._getColonPosition.bind(this);

        file.iterateNodesByType('ObjectExpression', function(node) {
            if (node.loc.start.line === node.loc.end.line || node.properties < 2) {
                return;
            }

            var maxColonStartPosition = 0;
            var skip = node.properties.some(function(property, index) {
                maxColonStartPosition = Math.max(maxColonStartPosition, getColonPosition(file, property).pos);

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

                var colonInfo = getColonPosition(file, property);

                if (colonInfo.pos !== maxColonStartPosition) {
                    errors.add('Alignment required', colonInfo.colon.loc.start);
                }
            });
        });
    }

};
