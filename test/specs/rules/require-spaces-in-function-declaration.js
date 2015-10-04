var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('function abc(){}'))
              .to.have.one.validation.error.from('requireSpacesInFunctionDeclaration');
        });

        it('should not report space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc (){}')).to.have.no.errors();
        });

        it('should not report space before round brace in export default function', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('export default function (){}')).to.have.no.errors();
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
        });

        it('should report missing space before curly brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc(){}'))
              .to.have.one.validation.error.from('requireSpacesInFunctionDeclaration');
        });

        it('should not report space before curly brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc() {}')).to.have.no.errors();
        });

        it('should not report space before curly brace in export default function', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('export default function() {}')).to.have.no.errors();
        });
    });
});
