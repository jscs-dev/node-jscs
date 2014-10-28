var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(identifiers) {
        assert(
            identifiers === true ||
            typeof identifiers === 'object',
            this.getOptionName() + ' option requires the value `true` ' +
            'or an object with String[] `allExcept` property'
        );

         // verify first item in `allExcept` property in object (if it's an object)
        assert(
            typeof identifiers !== 'object' ||
            Array.isArray(identifiers.allExcept) &&
            typeof identifiers.allExcept[0] === 'string',
            'Property `allExcept` in requireSpaceAfterLineComment should be an array of strings'
        );

        var isTrue = identifiers === true;
        var defaultIdentifiers = [
            '__proto__',
            '_',
            '__dirname',
            '__filename',
            'super_'
        ];

        if (isTrue) {
            identifiers = defaultIdentifiers;
        } else {
            identifiers = (identifiers.allExcept).concat(defaultIdentifiers);
        }

        this._identifierIndex = {};
        for (var i = 0, l = identifiers.length; i < l; i++) {
            this._identifierIndex[identifiers[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowDanglingUnderscores';
    },

    check: function(file, errors) {
        var allowedIdentifiers = this._identifierIndex;

        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if ((value[0] === '_' || value.slice(-1) === '_') &&
                !allowedIdentifiers[value]
            ) {
                errors.add(
                    'Invalid dangling underscore found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
