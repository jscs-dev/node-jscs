var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceBetweenArguments) {
        assert(
            typeof requireSpaceBetweenArguments === 'string' && /^[ ]?,[ ]?$/.test(requireSpaceBetweenArguments),
            'separator option requires string value containing only a comma and optional spaces'
        );

        this._separator = requireSpaceBetweenArguments;
    },

    getOptionName: function() {
        return 'requireSpaceBetweenArguments';
    },

    check: function(file, errors) {

        var tokens = file.getTokens();
        var validateTokens = this._separator.split('');
        var separatorBefore = validateTokens[0];
        var separatorAfter = validateTokens[validateTokens.length - 1];

        file.iterateNodesByType(['CallExpression'], function(node) {

            node.arguments.forEach(function(param, i) {

                var paramTokenPos = file.getTokenPosByRangeStart(param.range[0]);
                var punctuatorToken = tokens[paramTokenPos + 1];
                var argumentIndex = i + 1;

                if (punctuatorToken.value === ',') {

                    var nextParamToken = tokens[paramTokenPos + 2];

                    if (separatorBefore === ',' &&
                        punctuatorToken.range[0] !== param.range[1] &&
                        param.loc.start.line === nextParamToken.loc.start.line) {

                        errors.add(
                            'Unexpected space after argument ' + argumentIndex,
                            punctuatorToken.loc.start
                        );
                    } else if (separatorBefore === ' ' && punctuatorToken.range[0] === param.range[1]) {
                        errors.add(
                            'Missing space after argument ' + argumentIndex,
                            punctuatorToken.loc.start
                        );
                    } else if (separatorBefore === ' ' && (punctuatorToken.range[0] - param.range[1]) > 1) {
                        errors.add(
                            'Unexpected space before argument ' + argumentIndex,
                            param.loc.start
                        );
                    }

                    if (separatorAfter === ',' &&
                        punctuatorToken.range[1] < nextParamToken.range[0] &&
                        param.loc.start.line === nextParamToken.loc.start.line) {

                        errors.add(
                            'Unexpected space before argument ' + argumentIndex,
                            nextParamToken.loc.start
                        );
                    } else if (separatorAfter === ' ' && punctuatorToken.range[1] === nextParamToken.range[0]) {
                        errors.add(
                            'Missing space before argument ' + argumentIndex,
                            nextParamToken.loc.start
                        );
                    } else if (separatorAfter === ' ' && (nextParamToken.range[0] - punctuatorToken.range[1]) > 1) {
                        errors.add(
                            'Unexpected space before argument ' + argumentIndex,
                            nextParamToken.loc.start
                        );
                    }
                }
            });
        });
    }

};
