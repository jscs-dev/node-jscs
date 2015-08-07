var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-function', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInFunction: { beforeOpeningRoundBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before round brace in Function', function() {
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should not report missing space before round brace in named Function', function() {
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before round brace in Function', function() {
            assert(checker.checkString('var x = function (){}').getErrorCount() === 1);
        });

        it('should report space before round brace in named Function', function() {
            assert(checker.checkString('var x = function a (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc(){}').isEmpty());
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc (){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in getter', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before round brace in setter', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before round brace in getter', function() {
            assert(checker.checkString('var x = { get y() {} }').isEmpty());
        });

        it('should not report missing space before round brace in setter', function() {
            assert(checker.checkString('var x = { set y(v) {} }').isEmpty());
        });

        it('should report space before round brace in class method', function() {
            assert(checker.checkString('const Component = class { render () { return 1; } };').getErrorCount() === 1);
        });

        it('should not report missing space before round brace in class method', function() {
            assert(checker.checkString('const Component = class { render() { return 1; } };').isEmpty());
        });

        it('should not report missing space before round brace in method shorthand #1470', function() {
            assert(checker.checkString('var x = { y() {} }').isEmpty());
        });

        it('should report space before round brace in method shorthand #1470', function() {
            assert(checker.checkString('var x = { y () {} }').getErrorCount() === 1);
        });

        reportAndFix({
            name: 'extra space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function (){}',
            output: 'var x = function(){}'
        });

        reportAndFix({
            name: 'extra space before round brace in method shorthand',
            rules: rules,
            errors: 1,
            input: 'var x = { y (){} }',
            output: 'var x = { y(){} }'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            disallowSpacesInFunction: { beforeOpeningCurlyBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before curly brace in Function', function() {
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should report space before curly brace in Function', function() {
            assert(checker.checkString('var x = function() {}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in getter', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before curly brace in of setter', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before curly brace in getter', function() {
            assert(checker.checkString('var x = { get y (){} }').isEmpty());
        });

        it('should not report missing space before curly brace in setter', function() {
            assert(checker.checkString('var x = { set y (v){} }').isEmpty());
        });

        it('should not report missing space before round brace without option', function() {
            assert(checker.checkString('var x = function (){}').isEmpty());
        });

        it('should not report missing space before curly brace in method shorthand', function() {
            assert(checker.checkString('var x = { y(){} }').isEmpty());
        });

        it('should report space before curly brace in method shorthand', function() {
            assert(checker.checkString('var x = { y () {} }').getErrorCount() === 1);
        });

        it('should report special "constructor" method #1607', function() {
            assert(checker.checkString('class test { constructor() {} }').getErrorCount() === 1);
        });

        reportAndFix({
            name: 'extra space before curly brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function() {}',
            output: 'var x = function(){}'
        });

        reportAndFix({
            name: 'extra space before curly brace in method shorthand',
            rules: rules,
            errors: 1,
            input: 'var x = { y() {} }',
            output: 'var x = { y(){} }'
        });
    });
});
