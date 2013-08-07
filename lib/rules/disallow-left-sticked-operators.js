var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowLeftStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowLeftStickedOperators';
    },

    check: function(file, errors) {
        // in this check we ingore UnaryExpression such as "-2";

        var operators = this._operatorIndex;
        var tokens = file.getTokens();

        // 2 + 2, 2 == 2, a = 2
        file.iterateNodesByType(['AssignmentExpression', 'BinaryExpression'], function (node) {
            if (operators[node.operator]) {
                // get token after left part of expression
                var tokenLeftToOperatorPos = file.getTokenPosByRangeStart(node.left.range[1]);
                var tokenLeftToOperator = tokens[tokenLeftToOperatorPos];

                if (tokenLeftToOperator &&
                    tokenLeftToOperator.type === 'Punctuator' &&
                    tokenLeftToOperator.value === node.operator
                ) {
                    errors.add(
                        'Operator ' + tokenLeftToOperator.value + ' should not stick to preceding expression',
                        tokenLeftToOperator.loc.start
                    );
                }
            }
        });

        if (operators['=']) {
            // var a = 2;
            file.iterateNodesByType(['VariableDeclaration'], function (node) {
                node.declarations.forEach(function(declaration) {
                    // var foo;
                    if (!declaration.init) {
                        return;
                    }

                    // get token after var name
                    var tokenAfterVarNamePos = file.getTokenPosByRangeStart(declaration.id.range[1]);
                    var tokenAfterVarName = tokens[tokenAfterVarNamePos];

                    if (tokenAfterVarName) {
                        errors.add(
                            'Operator = should not stick to preceding expression',
                            tokenAfterVarName.loc.start
                        );
                    }
                });
            });
        }

        if (operators['?'] || operators[':'] > -1) {
            // a > 0 ? b : c
            file.iterateNodesByType('ConditionalExpression', function(node) {
                if (operators['?']) {
                    // get token after "test"
                    var tokenAfterTestPos = file.getTokenPosByRangeStart(node.test.range[1]);
                    var tokenAfterTest = tokens[tokenAfterTestPos];

                    if (tokenAfterTest &&
                        tokenAfterTest.type === 'Punctuator' &&
                        tokenAfterTest.value === '?'
                    ) {
                        errors.add(
                            'Operator ? should not stick to preceding expression',
                            tokenAfterTest.loc.start
                        );
                    }
                }

                if (operators[':']) {
                    // get token after "consequent"
                    var tokenAfterConsequentPos = file.getTokenPosByRangeStart(node.consequent.range[1]);
                    var tokenAfterConsequent = tokens[tokenAfterConsequentPos];

                    if (tokenAfterConsequent &&
                        tokenAfterConsequent.type === 'Punctuator' &&
                        tokenAfterConsequent.value === ':'
                    ) {
                        errors.add(
                            'Operator : should not stick to preceding expression',
                            tokenAfterConsequent.loc.start
                        );
                    }
                }

            });
        }
    }

};
