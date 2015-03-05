var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before round brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a (){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in getter expression', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before round brace in setter expression', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before round brace in getter expression', function() {
            assert(checker.checkString('var x = { get y() {} }').isEmpty());
        });

        it('should not report missing space before round brace in setter expression', function() {
            assert(checker.checkString('var x = { set y(v) {} }').isEmpty());
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before curly brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a() {}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in getter expression', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before curly brace in setter expression', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before curly brace in getter expression', function() {
            assert(checker.checkString('var x = { get y (){} }').isEmpty());
        });

        it('should not report missing space before curly brace in setter expression', function() {
            assert(checker.checkString('var x = { set y (v){} }').isEmpty());
        });

        it('should not report missing space before round brace without option', function() {
            assert(checker.checkString('var x = function a (){}').isEmpty());
        });
    });
});
