/**
 * Only allow words defined in a dictionary or by you.
 *
 * English language support is installed by default. To add additional
 * languages, go to the installation directory of JSCS and run `npm install
 * wordlist-LANGUAGE`, where LANGUAGE is the name of your language.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`: use the `"english"` dictionary
 *  - `Object`:
 *    - `dictionaries`: (default `["english"]`) array of dictionary names including
 *      `"english"`, `"american"`, `"british"` and `"canadian"`
 *    - `allowWordsInIdentifiersAndProperties`: additional words allowed anywhere
 *    - `allowWordsInProperties`: additional words allowed only as properties
 *    - `allowNamesForIdentifiersAndProperties`: names ignored by spellcheck
 *    - `allowNamesForProperties`: names ignored by spellcheck when used as properties
 *    - `excluded`: words to exclude from the dictionaries
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
 *     "allowNamesForProperties": [ "src" ],
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
 * return { transclude: function() {} };
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
 * ##### Valid for mode `"allowNamesForProperties": [ "src" ]`
 *
 * ```js
 * element.src = 'https://youtu.be/dQw4w9WgXcQ';
 * ```
 *
 * ##### Invalid for mode `"allowNamesForProperties": [ "src" ]`
 *
 * ```js
 * var data = { videoSrc: 'youtube' };
 * ```
 *
 * ##### Invalid for mode `"excluded": [ "i" ]`
 *
 * ```js
 * for (var i = 0; i < array.length; i++) {}
 * ```
 */

var assert = require('assert');
var assign = require('lodash.assign');
var indexOf = require('lodash.indexof');

var wordlistMap = {
    english: 'wordlist-english',
    american: 'wordlist-english',
    british: 'wordlist-english',
    canadian: 'wordlist-english',
};

// Breaks names like "fooBar" into ["foo", "bar"], etc.
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
    // Use String.prototype.replace to iterate over the words because it
    // provides an offset value useful for pinpointing a word's location.
    String(words).replace(reWords, function(word, offset) {
        word = word.toLowerCase();
        // Numbers may occasionally get orphaned; just ignore them.
        if (/^[0-9]*$/.test(word)) {
            return;
        }
        var hadWord;
        // Always ignore excluded words.
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

function isSignificantNode(node) {
    // Identifier and MemberExpression nodes always have parents, and those are
    // the only nodes that are passed to this function.
    return (
        (node.parentNode.type === 'VariableDeclarator' &&
         node.parentNode.id === node) ||
        (node.parentNode.type === 'AssignmentExpression' &&
         node.parentNode.left === node) ||
        node.parentNode.type === 'FunctionDeclaration' ||
        node.parentNode.type === 'FunctionExpression' ||
        node.parentNode.type === 'ClassDeclaration' ||
        node.parentNode.type === 'MethodDefinition' ||
        node.parentNode.type === 'LabeledStatement'
    );
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

        function arrayOption(option) {
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

        if (wasObject) {
            wordDictionaries = arrayOption('dictionaries') || wordDictionaries;
            identifierAndPropertyWords = arrayOption('allowWordsInIdentifiersAndProperties');
            propertyWords = arrayOption('allowWordsInProperties');
            identifierAndPropertyNames = arrayOption('allowNamesForIdentifiersAndProperties');
            propertyNames = arrayOption('allowNamesForProperties');
            excluded = arrayOption('excluded');
        }

        this._wordDictionaries = wordDictionaries.map(function(language) {
            var packageName = wordlistMap.hasOwnProperty(language) ?
                    // Special case where one package holds many wordlists.
                    wordlistMap[language] :
                    // General case where a package is one-to-one with a
                    // wordlist.
                    'wordlist-' + language;
            var wordlist;
            try {
                wordlist = require(packageName);
            } catch (error) {
                throw new Error(
                    'Package "' + packageName + '" is not installed but required ' +
                        'for spell-checking. Go to the installation directory of ' +
                        'JSCS and run "npm install ' + packageName + '"'
                );
            }
            return wordlist[language];
        });
        if (identifierAndPropertyWords) {
            this._wordDictionaries.push(identifierAndPropertyWords);
        }

        this._propertyWordDictionaries = this._wordDictionaries.slice();
        if (propertyWords) {
            this._propertyWordDictionaries.push(propertyWords);
        }

        this._nameDictionaries = [];
        if (identifierAndPropertyNames) {
            this._nameDictionaries.push(identifierAndPropertyNames);
        }

        this._propertyNameDictionaries = this._nameDictionaries.slice();
        if (propertyNames) {
            this._propertyNameDictionaries.push(propertyNames);
        }

        this._excluded = excluded;
    },

    getOptionName: function() {
        return 'requireDictionaryWords';
    },

    check: function(file, errors) {
        var _this = this;

        function check(wordDictionaries, nameDictionaries, name, start) {
            if (!dictionariesHaveWord(nameDictionaries, name)) {
                checkWords(
                    wordDictionaries,
                    _this._excluded,
                    errors,
                    name,
                    start
                );
            }
        }

        function checkIdentifierOrProperty(name, start) {
            check(
                _this._wordDictionaries,
                _this._nameDictionaries,
                name,
                start
            );
        }

        function checkProperty(name, start) {
            check(
                _this._propertyWordDictionaries,
                _this._propertyNameDictionaries,
                name,
                start
            );
        }

        file.iterateNodesByType('Identifier', function(node) {
            if (!isSignificantNode(node)) {
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
