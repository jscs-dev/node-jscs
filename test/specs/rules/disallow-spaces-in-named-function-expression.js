var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
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

        it('should not report missing space before round brace in method shorthand', function() {
            assert(checker.checkString('var x = { y() {} }').isEmpty());
        });

        it('should not report special "constructor" method #1607', function() {
            assert(checker.checkString('class test { constructor() {} }').isEmpty());
        });

        reportAndFix({
            name: 'illegal space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a (){}',
            output: 'var x = function a(){}'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
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

        it('should not report space before curly brace in method shorthand', function() {
            assert(checker.checkString('var x = { y () {} }').isEmpty());
        });

        it('should not report special "constructor" method #1607', function() {
            assert(checker.checkString('class test { constructor () {} }').isEmpty());
        });

        reportAndFix({
            name: 'missing space before curly brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a() {}',
            output: 'var x = function a(){}'
        });
    });
});
