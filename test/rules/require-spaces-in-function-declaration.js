var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-in-function-declaration', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true } });
        });

        it('should report missing space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc(){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc (){}').isEmpty());
        });

    });

    describe('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
        });

        it('should report missing space before curly brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc(){}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc() {}').isEmpty());
        });

        it('should not report missing space before round brace without option', function() {
            assert(checker.checkString('function abc() {}').isEmpty());
        });
    });
});
