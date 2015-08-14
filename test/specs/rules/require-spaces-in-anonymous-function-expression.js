var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-in-anonymous-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw if allExcept empty array', function() {
            assert.throws(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: [] } });
            });
        });

        it('should throw if not allExcept array or true', function() {
            assert.throws(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: {} } });
            });

            assert.throws(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: false } });
            });
        });

        it('should throw if allExcept unrecognized', function() {
            assert.throws(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: ['foo'] } });
            });
        });
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            requireSpacesInAnonymousFunctionExpression: { beforeOpeningRoundBrace: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before round brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function(){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in FunctionExpression', function() {
            assert(checker.checkString('var x = function (){}').isEmpty());
        });

        it('should not report named FunctionExpression', function() {
            assert(checker.checkString('var x = function test() {}').isEmpty());
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
            requireSpacesInAnonymousFunctionExpression: { beforeOpeningCurlyBrace: true },
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

    describe('exception for shorthand methods', function() {
        function configureChecker(allExcept) {
            // Coverage hack: allExcept can be configured two different ways.
            var rules = {
                requireSpacesInAnonymousFunctionExpression: {
                    beforeOpeningRoundBrace: true,
                    beforeOpeningCurlyBrace: true,
                    allExcept: allExcept
                },
                esnext: true
            };
            checker.configure(rules);
        }

        it('should not report missing space before round brace', function() {
            configureChecker(['shorthand']);
            assert(checker.checkString('var x = { y() {} }').isEmpty());
        });

        it('should not report missing space before curly brace', function() {
            configureChecker(true);
            assert(checker.checkString('var x = { y (){} }').isEmpty());
        });
    });
});
