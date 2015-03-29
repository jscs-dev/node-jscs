/**
 * Only allows words defined in a dictionary or defined by the user.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`
 *  - `Object`:
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

var isExceptionalName = dictionariesHaveWord;

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var wasObject = typeof options === 'object' && options !== null;
        assert(
            options === true || wasObject,
            this.getOptionName() + ' option requires a true or object value ' +
                'or should be removed'
        );

        var identifierAndPropertyWords;
        var propertyWords;
        var identifierAndPropertyNames;
        var propertyNames;
        var excluded;
        if (wasObject) {
            identifierAndPropertyWords = options.allowWordsInIdentifiersAndProperties;
            if (identifierAndPropertyWords !== undefined) {
                assert(
                    Array.isArray(identifierAndPropertyWords),
                    this.getOptionName() + '.allowWordsInIdentifiersAndProperties ' +
                        'option requires an array value or should be removed'
                );
            }
            propertyWords = options.allowWordsInProperties;
            if (propertyWords !== undefined) {
                assert(
                    Array.isArray(propertyWords),
                    this.getOptionName() + '.allowWordsInProperties option ' +
                        'requires an array value or should be removed'
                );
            }
            identifierAndPropertyNames = options.allowNamesForIdentifiersAndProperties;
            if (identifierAndPropertyNames !== undefined) {
                assert(
                    Array.isArray(identifierAndPropertyNames),
                    this.getOptionName() + '.allowNamesForIdentifiersAndProperties ' +
                        'option requires an array value or should be removed'
                );
            }
            propertyNames = options.allowNamesForProperties;
            if (propertyNames !== undefined) {
                assert(
                    Array.isArray(propertyNames),
                    this.getOptionName() + '.allowNamesForProperties option ' +
                        'requires an array value or should be removed'
                );
            }
            excluded = options.excluded;
            if (excluded !== undefined) {
                assert(
                    Array.isArray(excluded),
                    this.getOptionName() + '.excluded option requires an ' +
                        'array value or should be removed'
                );
            }
        }

        var englishWords = require('../dictionaries/english-words.json');
        var jsNames = require('../dictionaries/js-names.json');
        var jsPropertyNames = require('../dictionaries/js-property-names.json');

        this._excluded = excluded;

        this._wordDictionaries = [
            englishWords
        ];
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
    },

    getOptionName: function() {
        return 'requireDictionaryWords';
    },

    check: function(file, errors) {
        var excluded = this._excluded;
        var wordDictionaries = this._wordDictionaries;
        var nameDictionaries = this._nameDictionaries;
        var propertyWordDictionaries = this._propertyWordDictionaries;
        var propertyNameDictionaries = this._propertyNameDictionaries;

        file.iterateNodesByType('Identifier', function(node) {
            if (
                node.parentNode &&
                node.parentNode.type === 'MemberExpression' &&
                !node.parentNode.computed
            ) {
                return;
            }
            var name = node.name;
            if (!isExceptionalName(nameDictionaries, name)) {
                checkWords(
                    wordDictionaries,
                    excluded,
                    errors,
                    name,
                    node.loc.start
                );
            }
        });

        file.iterateNodesByType('MemberExpression', function(node) {
            var name;
            if (node.property.type === 'Identifier' && !node.computed) {
                name = node.property.name;
                if (!isExceptionalName(propertyNameDictionaries, name)) {
                    checkWords(
                        propertyWordDictionaries,
                        excluded,
                        errors,
                        name,
                        node.property.loc.start
                    );
                }
            } else if (node.property.type === 'Literal') {
                name = node.property.value;
                if (!isExceptionalName(propertyNameDictionaries, name)) {
                    checkWords(
                        propertyWordDictionaries,
                        excluded,
                        errors,
                        name,
                        node.property.loc.start
                    );
                }
            }
        });

    }

};
