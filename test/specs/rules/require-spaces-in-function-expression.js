var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-in-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            requireSpacesInFunctionExpression: { beforeOpeningRoundBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before round brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function(){}').getErrorCount() === 1);
        });

        it('should report missing space before round brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a(){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function (){}').isEmpty());
        });

        it('should not report space before round brace in named FunctionExpression', function() {
            assert(checker.checkString('var x = function a (){}').isEmpty());
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc(){}').isEmpty());
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

        it('should report missing space before round brace in method shorthand #1470', function() {
            assert(checker.checkString('var x = { y() {} }').getErrorCount() === 1);
        });

        it('should not report space before round brace in method shorthand #1470', function() {
            assert(checker.checkString('var x = { y () {} }').isEmpty());
        });

        it('should not report space before round brace in class method', function() {
            assert(checker.checkString('const Component = class { render () { return 1; } };').isEmpty());
        });

        it('should report missing space before round brace in class method', function() {
            assert(checker.checkString('const Component = class { render() { return 1; } };').getErrorCount() === 1);
        });

        reportAndFix({
            name: 'missing space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function(){}',
            output: 'var x = function (){}'
        });

        reportAndFix({
            name: 'missing space before round brace in method shorthand',
            rules: rules,
            errors: 1,
            input: 'var x = { y(){} }',
            output: 'var x = { y (){} }'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            requireSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before curly brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function(){}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function() {}').isEmpty());
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
            assert(checker.checkString('var x = function() {}').isEmpty());
        });

        it('should report missing space before curly brace in method shorthand', function() {
            assert(checker.checkString('var x = { y(){} }').getErrorCount() === 1);
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
            input: 'var x = function(){}',
            output: 'var x = function() {}'
        });

        reportAndFix({
            name: 'missing space before curly brace in method shorthand',
            rules: rules,
            errors: 1,
            input: 'var x = { y(){} }',
            output: 'var x = { y() {} }'
        });
    });
});
