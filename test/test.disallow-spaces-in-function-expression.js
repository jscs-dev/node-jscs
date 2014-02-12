var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {

        it('should not report missing space before round brace in FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before round brace in FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function (){}').getErrorCount() === 1);
        });

        it('should report space before round brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('function abc(){}').isEmpty());
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('function abc (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace without option', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function (){}').isEmpty());
        });

    });

    describe('beforeOpeningCurlyBrace', function() {

        it('should not report missing space before curly brace in FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should report space before curly brace in FunctionExpression', function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function() {}').getErrorCount() === 1);
        });
    });
});
