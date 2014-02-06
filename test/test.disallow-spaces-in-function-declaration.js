var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-function-declaration', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('function abc(){}').isEmpty());
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true } });
            assert(checker.checkString('function abc (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace without option', function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('function abc (){}').isEmpty());
        });

    });

    describe('beforeOpeningCurlyBrace', function() {

        it('should not report missing space before curly brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('function abc(){}').isEmpty());
        });

        it('should report space before curly brace in FunctionDeclaration', function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
            assert(checker.checkString('function abc() {}').getErrorCount() === 1);
        });
    });
});
