/**
 * Requires curly braces after statements.
 *
 * Types: `Array` or `Boolean`
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
            this.getOptionName() + ' option requires array or true value'
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

        function isNotABlockStatement(node) {
            return node && node.type !== 'BlockStatement';
        }

        function addError(typeString, entity) {
            errors.add(
                typeString + ' statement without curly braces',
                entity.loc.start.line,
                entity.loc.start.column
            );
        }

        function checkBody(type, typeString) {
            file.iterateNodesByType(type, function(node) {
                if (isNotABlockStatement(node.body)) {
                    addError(typeString, node);
                }
            });
        }

        var typeIndex = this._typeIndex;

        if (typeIndex.if || typeIndex.else) {
            file.iterateNodesByType('IfStatement', function(node) {
                if (typeIndex.if && isNotABlockStatement(node.consequent)) {
                    addError('If', node);
                }
                if (typeIndex.else && isNotABlockStatement(node.alternate) &&
                    node.alternate.type !== 'IfStatement') {
                    addError('Else', file.getPrevToken(file.getFirstNodeToken(node.alternate)));
                }
            });
        }

        if (typeIndex.case || typeIndex.default) {
            file.iterateNodesByType('SwitchCase', function(node) {
                // empty case statement
                if (node.consequent.length === 0) {
                    return;
                }

                if (node.consequent.length === 1 && node.consequent[0].type === 'BlockStatement') {
                    return;
                }

                if (node.test === null && typeIndex.default) {
                    addError('Default', node);
                }

                if (node.test !== null && typeIndex.case) {
                    addError('Case', node);
                }
            });
        }

        if (typeIndex.while) {
            checkBody('WhileStatement', 'While');
        }

        if (typeIndex.for) {
            checkBody('ForStatement', 'For');
            checkBody('ForInStatement', 'For in');
            checkBody('ForOfStatement', 'For of');
        }

        if (typeIndex.do) {
            checkBody('DoWhileStatement', 'Do while');
        }

        if (typeIndex.with) {
            checkBody('WithStatement', 'With');
        }
    }

};
