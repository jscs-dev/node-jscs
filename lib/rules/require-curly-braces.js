/**
 * Requires curly braces after statements.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of quoted keywords or `true` to require curly braces after the following keywords:
 *
 * JSHint: [`curly`](http://jshint.com/docs/options/#curly)
 *
 * #### Example
 *
 * ```js
 * "requireCurlyBraces": [
 *     "if",
 *     "else",
 *     "for",
 *     "while",
 *     "do",
 *     "try",
 *     "catch",
 *     "case",
 *     "default"
 * ]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (x) {
 *     x++;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (x) x++;
 * ```
 */

var assert = require('assert');
var defaultKeywords = require('../utils').curlyBracedKeywords;

module.exports = function() {};

module.exports.prototype = {

    configure: function(statementTypes) {
        assert(
            Array.isArray(statementTypes) || statementTypes === true,
            'requireCurlyBraces option requires array or true value'
        );

        if (statementTypes === true) {
            statementTypes = defaultKeywords;
        }

        this._typeIndex = {};
        for (var i = 0, l = statementTypes.length; i < l; i++) {
            this._typeIndex[statementTypes[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireCurlyBraces';
    },

    check: function(file, errors) {

        function addError(typeString, node) {
            var entity = node;

            if (typeString === 'Else') {
                entity = file.findPrevToken(
                    file.getTokenByRangeStart(node.alternate.range[0]),
                    'Keyword',
                    'else'
                );
            }

            errors.add(
                typeString + ' statement without curly braces',
                entity.loc.start.line,
                entity.loc.start.column
            );
        }

        function checkBody(type, typeString) {
            file.iterateNodesByType(type, function(node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    addError(typeString, node);
                }
            });
        }

        var typeIndex = this._typeIndex;

        if (typeIndex['if'] || typeIndex['else']) {
            file.iterateNodesByType('IfStatement', function(node) {
                if (typeIndex.if && node.consequent && node.consequent.type !== 'BlockStatement') {
                    addError('If', node);
                }
                if (typeIndex['else'] && node.alternate &&
                    node.alternate.type !== 'BlockStatement' &&
                    node.alternate.type !== 'IfStatement'
                ) {
                    addError('Else', node);
                }
            });
        }

        if (typeIndex['case'] || typeIndex['default']) {
            file.iterateNodesByType('SwitchCase', function(node) {
                // empty case statement
                if (!node.consequent || node.consequent.length === 0) {
                    return;
                }

                if (node.consequent.length === 1 && node.consequent[0].type === 'BlockStatement') {
                    return;
                }

                if (node.test === null && typeIndex['default']) {
                    addError('Default', node);
                }

                if (node.test !== null && typeIndex['case']) {
                    addError('Case', node);
                }
            });
        }

        if (typeIndex['while']) {
            checkBody('WhileStatement', 'While');
        }

        if (typeIndex['for']) {
            checkBody('ForStatement', 'For');
            checkBody('ForInStatement', 'For in');
        }

        if (typeIndex['do']) {
            checkBody('DoWhileStatement', 'Do while');
        }

        if (typeIndex['with']) {
            checkBody('WithStatement', 'With');
        }
    }

};
