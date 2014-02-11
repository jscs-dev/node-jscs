var assert = require('assert');
var spaceAfterKeywords = require('./space-after-keywords');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = false;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceAfterKeywords';
    },

    check: function(file, errors) {
        /* jshint unused: false */
        spaceAfterKeywords.prototype.check.apply(this, arguments);
    }

};
