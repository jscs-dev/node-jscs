/**
 * Requires the file to be at most the number of lines specified
 *
 * Type: `Integer`
 *
 * Values:
*  - `Integer`: file should be at most the number of lines specified
 *
 * #### Example
 *
 * ```js
 * "maximumNumberOfLines": 100
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            typeof options === 'number',
            this.getOptionName() + ' option requires number value or should be removed'
        );
        this._maximumNumberOfLines = options;
    },

    getOptionName: function() {
        return 'maximumNumberOfLines';
    },

    check: function(file, errors) {
        var firstToken = file.getFirstToken();
        var lastToken = file.getLastToken();

        errors.assert.linesBetween({
            token: firstToken,
            nextToken: lastToken,
            atMost: this._maximumNumberOfLines - 1,
            message: 'File must be at most ' + this._maximumNumberOfLines + ' lines long'
        });
    }

};
