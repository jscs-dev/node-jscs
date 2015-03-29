/**
 * Only allows words defined in a dictionary or defined by the user.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`
 *  - `Object`:
 *    - `includedForIdentifiersAndProperties`: define additional words allowed anywhere
 *    - `includedForProperties`: define additional words allowed only as properties
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
            hadWord = dictionaries.some(function(dictionary) {
                return hasWord(dictionary, word);
            });
        }
        if (!hadWord) {
            errors.add('Non-dictionary word: ' + word, start);
        }
    });
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

        var identifiersAndProperties;
        var properties;
        var excluded;
        if (wasObject) {
            identifiersAndProperties = options.includedForIdentifiersAndProperties;
            if (identifiersAndProperties !== undefined) {
                assert(
                    Array.isArray(identifiersAndProperties),
                    this.getOptionName() + '.includedForIdentifiersAndProperties ' +
                        'option requires an array value or should be removed'
                );
            }
            properties = options.includedForProperties;
            if (properties !== undefined) {
                assert(
                    Array.isArray(properties),
                    this.getOptionName() + '.includedForProperties option ' +
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

        var englishDictionary = require('../dictionaries/english.json');
        var jsDictionary = require('../dictionaries/js.json');
        var jsPropertyDictionary = require('../dictionaries/js-properties.json');

        this._excluded = excluded;

        this._dictionaries = [
            englishDictionary,
            jsDictionary
        ];

        if (identifiersAndProperties) {
            this._dictionaries.push(identifiersAndProperties);
        }

        this._propertyDictionaries = this._dictionaries.concat([
            jsPropertyDictionary
        ]);

        if (properties) {
            this._propertyDictionaries.push(properties);
        }

    },

    getOptionName: function() {
        return 'requireDictionaryWords';
    },

    check: function(file, errors) {
        var excluded = this._excluded;
        var dictionaries = this._dictionaries;
        var propertyDictionaries = this._propertyDictionaries;

        file.iterateNodesByType('Identifier', function(node) {
            if (
                node.parentNode &&
                node.parentNode.type === 'MemberExpression' &&
                !node.parentNode.computed
            ) {
                return;
            }
            checkWords(
                dictionaries,
                excluded,
                errors,
                node.name,
                node.loc.start
            );
        });

        file.iterateNodesByType('MemberExpression', function(node) {
            if (node.property.type === 'Identifier' && !node.computed) {
                checkWords(
                    propertyDictionaries,
                    excluded,
                    errors,
                    node.property.name,
                    node.property.loc.start
                );
            } else if (node.property.type === 'Literal') {
                checkWords(
                    propertyDictionaries,
                    excluded,
                    errors,
                    node.property.value,
                    node.property.loc.start
                );
            }
        });

    }

};
