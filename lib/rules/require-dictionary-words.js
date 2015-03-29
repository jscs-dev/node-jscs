/**
 * Only allows words defined in a dictionary or defined by the user.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`
 *  - `Object`:
 *    - `dictionaries`: (default `["english"]`) specify dictionaries among
 *      `"english"`, `"american"`, `"british"` and `"canadian"`
 *    - `allowWordsInIdentifiersAndProperties`: define additional words allowed anywhere
 *    - `allowWordsInProperties`: define additional words allowed only as properties
 *    - `allowNamesForIdentifiersAndProperties`: define names excepted from spellcheck
 *    - `allowNamesForProperties`: define names excepted from spellcheck only as properties
 *    - `excluded`: exclude words
 *
 * #### Example
 *
 * ```js
 * "requireDictionaryWords": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var number = 1;
 * object['attribute'] = 2;
 * object.attribute = 3;
 * quickBrownFoxes = 4;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var num = 1;
 * obj['attr'] = 2;
 * obj.attr = 3;
 * qkBrFoxes = 4;
 * ```
 */

var assert = require('assert');
var indexOf = require('lodash.indexof');

var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]';
    var lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
}());

function hasWord(dictionary, word) {
    return indexOf(dictionary, word, true) > -1;
}

function dictionariesHaveWord(dictionaries, word) {
    return dictionaries.some(function(dictionary) {
        return hasWord(dictionary, word);
    });
}

function checkWords(dictionaries, excluded, errors, words, start) {
    (String(words).match(reWords) || []).forEach(function(word) {
        word = word.toLowerCase();
        if (/^[0-9]*$/.test(word)) {
            return;
        }
        var hadWord;
        if (hasWord(excluded, word)) {
            hadWord = false;
        } else {
            hadWord = dictionariesHaveWord(dictionaries, word);
        }
        if (!hadWord) {
            errors.add('Non-dictionary word: ' + word, start);
        }
    });
}

function validateArrayOption(options, option) {
    var value = options[option];
    if (value !== undefined) {
        assert(
            Array.isArray(value),
            'requireDictionaryWords.' + option + ' option requires ' +
                'an array value or should be removed'
        );
    }
    return value;
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var wasObject = typeof options === 'object' && options !== null;
        assert(
            options === true || wasObject,
            this.getOptionName() + ' option requires a true or object value ' +
                'or should be removed'
        );

        var wordDictionaries = ['english'];
        var identifierAndPropertyWords;
        var propertyWords;
        var identifierAndPropertyNames;
        var propertyNames;
        var excluded;
        if (wasObject) {
            wordDictionaries = validateArrayOption(options, 'dictionaries') ||
                wordDictionaries;
            identifierAndPropertyWords = validateArrayOption(
                options,
                'allowWordsInIdentifiersAndProperties'
            );
            propertyWords = validateArrayOption(options, 'allowWordsInProperties');
            identifierAndPropertyNames = validateArrayOption(
                options,
                'allowNamesForIdentifiersAndProperties'
            );
            propertyNames = validateArrayOption(options, 'allowNamesForProperties');
            excluded = validateArrayOption(options, 'excluded');
        }

        var jsNames = require('../dictionaries/js-names.json');
        var jsPropertyNames = require('../dictionaries/js-property-names.json');

        this._wordDictionaries = wordDictionaries.map(function(language) {
            return require('../dictionaries/' + language + '-words.json');
        });
        if (identifierAndPropertyWords) {
            this._wordDictionaries.push(identifierAndPropertyWords);
        }

        this._propertyWordDictionaries = this._wordDictionaries.slice();
        if (propertyWords) {
            this._propertyWordDictionaries.push(propertyWords);
        }

        this._nameDictionaries = [
            jsNames
        ];
        if (identifierAndPropertyNames) {
            this._nameDictionaries.push(identifierAndPropertyNames);
        }

        this._propertyNameDictionaries = this._nameDictionaries.concat([
            jsPropertyNames
        ]);
        if (propertyNames) {
            this._propertyNameDictionaries.push(propertyNames);
        }

        this._excluded = excluded;
    },

    getOptionName: function() {
        return 'requireDictionaryWords';
    },

    check: function(file, errors) {
        var check = function (dictionary, name, start) {
            var wordDictionaries;
            var nameDictionaries;
            if (dictionary === 'property') {
                wordDictionaries = this._propertyWordDictionaries;
                nameDictionaries = this._propertyNameDictionaries;
            } else {
                wordDictionaries = this._wordDictionaries;
                nameDictionaries = this._nameDictionaries;
            }
            if (!dictionariesHaveWord(nameDictionaries, name)) {
                checkWords(
                    wordDictionaries,
                    this._excluded,
                    errors,
                    name,
                    start
                );
            }
        }.bind(this);

        function checkIdentifierOrProperty(name, start) {
            check(null, name, start);
        }

        function checkProperty(name, start) {
            check('property', name, start);
        }

        file.iterateNodesByType('Identifier', function(node) {
            if (
                node.parentNode &&
                    ((node.parentNode.type === 'MemberExpression' &&
                      !node.parentNode.computed) ||
                     node.parentNode.type === 'Property')
            ) {
                return;
            }
            checkIdentifierOrProperty(node.name, node.loc.start);
        });

        file.iterateNodesByType('MemberExpression', function(node) {
            if (node.property.type === 'Identifier' && !node.computed) {
                checkProperty(node.property.name, node.property.loc.start);
            } else if (node.property.type === 'Literal') {
                checkProperty(node.property.value, node.property.loc.start);
            }
        });

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                if (prop.shorthand || prop.method || prop.kind !== 'init') {
                    return;
                }

                var key = prop.key;
                if (key.type === 'Identifier') {
                    checkProperty(key.name, key.loc.start);
                } else if (key.type === 'Literal') {
                    checkProperty(key.value, key.loc.start);
                }
            });
        });

    }

};
