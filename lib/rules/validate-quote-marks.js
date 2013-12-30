var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(allowedQuoteMark) {
        assert(
            allowedQuoteMark === '"' || allowedQuoteMark === '\'' || allowedQuoteMark === true,
            'validateQuoteMarks option requires \'"\', "\'", or boolean true'
        );

        this._allowedQuoteMark = allowedQuoteMark;
    },

    getOptionName: function () {
        return 'validateQuoteMarks';
    },

    check: function(file, errors) {
        var allowedQuoteMark = this._allowedQuoteMark;

        file.iterateTokensByType('String', function(token) {
            if (allowedQuoteMark === true) {
                allowedQuoteMark = token.value[0];
            }

            if (token.value[0] !== allowedQuoteMark) {
                errors.add(
                    'Invalid quote mark found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
