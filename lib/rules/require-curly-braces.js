var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(statementTypes) {
        assert(Array.isArray(statementTypes), 'requireCurlyBraces option requires array value');
        this._typeIndex = {};
        for (var i = 0, l = statementTypes.length; i < l; i++) {
            this._typeIndex[statementTypes[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireCurlyBraces';
    },

    check: function(file, errors) {
        var typeIndex = this._typeIndex;
        if (typeIndex['if'] || typeIndex['else']) {
            file.iterateNodesByType('IfStatement', function (node) {
                if (typeIndex.if && node.consequent && node.consequent.type !== 'BlockStatement') {
                    errors.add('If statement without curly braces', node.loc.start.line, node.loc.start.column);
                }
                if (typeIndex['else'] && node.alternate &&
                    node.alternate.type !== 'BlockStatement' &&
                    node.alternate.type !== 'IfStatement'
                ) {
                    errors.add(
                        'Else statement without curly braces',
                        node.alternate.loc.start.line,
                        node.alternate.loc.start.column
                    );
                }
            });
        }
        if (typeIndex['while']) {
            file.iterateNodesByType('WhileStatement', function (node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    errors.add('While statement without curly braces', node.loc.start.line, node.loc.start.column);
                }
            });
        }
        if (typeIndex['for']) {
            file.iterateNodesByType('ForStatement', function (node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    errors.add('For statement without curly braces', node.loc.start.line, node.loc.start.column);
                }
            });
            file.iterateNodesByType('ForInStatement', function (node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    errors.add('For in statement without curly braces', node.loc.start.line, node.loc.start.column);
                }
            });
        }
        if (typeIndex['do']) {
            file.iterateNodesByType('DoWhileStatement', function (node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    errors.add('Do while statement without curly braces', node.loc.start.line, node.loc.start.column);
                }
            });
        }
    }

};
