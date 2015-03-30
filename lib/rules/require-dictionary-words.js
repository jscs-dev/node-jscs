/**
 * Only allow words defined in a dictionary or by you.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`: just use the `"english"` dictionary with no modifications
 *  - `Object`:
 *    - `dictionaries`: (default `["english"]`) array of dictionary names including
 *      `"english"`, `"american"`, `"british"` and `"canadian"`
 *    - `allowWordsInIdentifiersAndProperties`: array of additional words allowed anywhere
 *    - `allowWordsInProperties`: array of additional words allowed only as properties
 *    - `allowNamesForIdentifiersAndProperties`: array of names for spellcheck to ignore
 *    - `allowNamesForProperties`: array of names for spellcheck to ignore as properties
 *    - `excluded`: array of words defined in the dictionary to exclude from the dictionary
 *
 * #### Example
 *
 * ```js
 * "requireDictionaryWords": true
 *
 * "requireDictionaryWords": {
 *     "dictionaries": [ "english", "american" ],
 *     "allowWordsInIdentifiersAndProperties": [ "transclude" ],
 *     "allowWordsInProperties": [ "chmod" ],
 *     "allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ],
 *     "allowNamesForProperties": [ "attr" ],
 *     "excluded": [ "i" ]
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var number = 1;
 * object['source'] = 2;
 * object.source = 3;
 * fileDirectory = 4;
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var num = 1;
 * obj['src'] = 2;
 * obj.src = 3;
 * fileDir = 4;
 * ```
 *
 * ##### Valid for mode `"dictionaries": [ "american" ]`, invalid for `"british"`
 *
 * ```js
 * var color = 'papayawhip';
 * ```
 *
 * ##### Valid for mode `"dictionaries": [ "british" ]`, invalid for `"american"`
 *
 * ```js
 * var colour = 'papayawhip';
 * ```
 *
 * ##### Valid for mode `"allowWordsInIdentifiersAndProperties": [ "transclude" ]`
 *
 * ```js
 * var transclude = function() {};
 * var transcludeFunction = function() {};
 * return {
 *     transclude: transclude
 * };
 * ```
 *
 * ##### Valid for mode `"allowWordsInProperties": [ "chmod" ]`
 *
 * ```js
 * var mode = 0777;
 * fs.chmod('/', mode, function(error) {});
 * fs.chmodSync('/', mode);
 * ```
 *
 * ##### Invalid for mode `"allowWordsInProperties": [ "chmod" ]`
 *
 * ```js
 * var chmod = 0777;
 * ```
 *
 * ##### Valid for mode `"allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ]`
 *
 * ```js
 * var util = require('util');
 * function Controller($stateParams) {}
 * ```
 *
 * ##### Invalid for mode `"allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ]`
 *
 * ```js
 * var stringUtil = {};
 * var params = {};
 * ```
 *
 * ##### Valid for mode `"allowNamesForProperties": [ "attr" ]`
 *
 * ```js
 * var language = $('html').attr('lang');
 * ```
 *
 * ##### Invalid for mode `"allowNamesForProperties": [ "attr" ]`
 *
 * ```js
 * var attr = element.getAttribute('lang');
 * ```
 *
 * ##### Valid for mode `"excluded": [ "i" ]`
 *
 * ```js
 * for (var index = 0; index < array.length; index += 1) {
 *     // ...
 * }
 * ```
 *
 * ##### Invalid for mode `"excluded": [ "i" ]`
 *
 * ```js
 * for (var i = 0; i < array.length; i++) {
 *     // ...
 * }
 * ```
 */

var assert = require('assert');
var assign = require('lodash.assign');
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
    String(words).replace(reWords, function(word, offset) {
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
            var location;
            if (offset === 0) {
                location = start;
            } else {
                location = assign({}, start);
                location.column += offset;
            }
            errors.add('Non-dictionary word "' + word + '"', location);
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

function isSignificantNode(node) {
    if (node.parentNode) {
        return (
            (node.parentNode.type === 'AssignmentExpression' &&
             node.parentNode.left === node) ||
            node.parentNode.type === 'FunctionDeclaration' ||
            node.parentNode.type === 'FunctionExpression' ||
            (node.parentNode.type === 'VariableDeclarator' &&
             node.parentNode.id === node)
        );
    } else {
        // A node without a parent may be significant.
        return true;
    }
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
        var check = function(dictionary, name, start) {
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
                     node.parentNode.type === 'Property' ||
                     !isSignificantNode(node))
            ) {
                return;
            }
            checkIdentifierOrProperty(node.name, node.loc.start);
        });

        file.iterateNodesByType('MemberExpression', function(node) {
            if (!isSignificantNode(node)) {
                return;
            }
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