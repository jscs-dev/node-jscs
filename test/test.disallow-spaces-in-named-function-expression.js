var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {

        it('should not report missing space before round brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before round brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('var x = function a (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace without option', function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a (){}').isEmpty());
        });

    });

    describe('beforeOpeningCurlyBrace', function() {

        it('should not report missing space before curly brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before curly brace in named FunctionExpression', function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('var x = function a() {}').getErrorCount() === 1);
        });
    });
});
