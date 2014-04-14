var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            typeof options === 'object',
            'requireSingleSpaceBeforeOperators option must be an object'
        );

        this._mapIndex = {};
        var key = null;
        var i   = null;
        var l   = null;
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                assert(
                    Array.isArray(options[key]),
                    'requireSingleSpaceBeforeOperators option `' + key + '` must be an array'
                );

                this._mapIndex[key] = {};
                for (i = 0, l = options[key].length; i < l; i += 1) {
                    this._mapIndex[key][options[key][i]] = true;
                }
            }
        }
    },

    getOptionName: function() {
        return 'requireSingleSpaceBeforeOperators';
    },

    check: function(file, errors) {
        var mapIndex = this._mapIndex;

        file.iterateTokensByType([ 'Keyword', 'Identifier', 'Punctuator' ], function (token, i, tokens) {
            if (!mapIndex.hasOwnProperty(token.value)) return;
            var index = mapIndex[token.value];

            var prevToken = tokens[i - 1];
            if (!prevToken || !index.hasOwnProperty(prevToken.value)) return;

            if (
                token.loc.start.line === prevToken.loc.start.line &&
                1 === token.loc.start.column - prevToken.loc.end.column
            ) {
                return;
            }

            errors.add(
                'Single space required before `' + token.value + '` after `' + prevToken.value + '`.',
                token.loc.end.line,
                token.loc.end.column
            );
        });
    }

};
