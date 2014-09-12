var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(validateParameterSeparator) {
        assert(
            typeof validateParameterSeparator === 'string' && /^[ ]?,[ ]?$/.test(validateParameterSeparator),
            'validateParameterSpacing option requires string value containing only a comma and optional spaces'
        );

        this._separator = validateParameterSeparator;
    },

    getOptionName: function() {
        return 'validateParameterSeparator';
    },

    check: function(file, errors) {

        var tokens = file.getTokens();
        var validateTokens = this._separator.split('');
        var separatorBefore = validateTokens[0];
        var separatorAfter = validateTokens[validateTokens.length - 1];

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {

            node.params.forEach(function(param) {

                var paramTokenPos = file.getTokenPosByRangeStart(param.range[0]);
                var punctuatorToken = tokens[paramTokenPos + 1];

                if (punctuatorToken.value === ',') {

                    var nextParamToken = tokens[paramTokenPos + 2];

                    if (separatorBefore === ',' &&
                        punctuatorToken.range[0] !== param.range[1] &&
                        param.loc.start.line === nextParamToken.loc.start.line) {

                        errors.add(
                            'Unexpected space after function parameter \'' + param.name + '\'',
                            punctuatorToken.loc.start
                        );
                    } else if (separatorBefore === ' ' && punctuatorToken.range[0] === param.range[1]) {
                        errors.add(
                            'Missing space after function parameter \'' + param.name + '\'',
                            punctuatorToken.loc.start
                        );
                    }

                    if (separatorAfter === ',' &&
                        punctuatorToken.range[1] < nextParamToken.range[0] &&
                        param.loc.start.line === nextParamToken.loc.start.line) {

                        errors.add(
                            'Unexpected space before function parameter \'' + nextParamToken.value + '\'',
                            nextParamToken.loc.start
                        );
                    } else if (separatorAfter === ' ' && punctuatorToken.range[1] === nextParamToken.range[0]) {
                        errors.add(
                            'Missing space before function parameter \'' + nextParamToken.value + '\'',
                            nextParamToken.loc.start
                        );
                    }
                }
            });
        });
    }

};
