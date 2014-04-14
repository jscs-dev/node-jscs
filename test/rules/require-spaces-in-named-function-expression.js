var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {

        it('should report missing space before round brace in named FunctionExpression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a(){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in named FunctionExpression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a (){}').isEmpty());
        });

        it('should not report missing space before round brace without option', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a() {}').isEmpty());
        });

        it('should not report space before round brace in getter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before round brace in setter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before round brace in getter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = { get y() {} }').isEmpty());
        });

        it('should not report missing space before round brace in setter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = { set y(v) {} }').isEmpty());
        });
    });

    describe('beforeOpeningCurlyBrace', function() {

        it('should report missing space before curly brace in named FunctionExpression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a(){}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in named FunctionExpression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a() {}').isEmpty());
        });

        it('should not report space before curly brace in getter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before curly brace in setter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before curly brace in getter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = { get y (){} }').isEmpty());
        });

        it('should not report missing space before curly brace in setter expression', function() {
            checker.configure({ requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = { set y (v){} }').isEmpty());
        });
    });
});
