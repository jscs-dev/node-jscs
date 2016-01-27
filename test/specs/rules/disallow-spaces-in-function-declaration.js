var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-spaces-in-function-declaration', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionDeclaration');
        });

        it('should not report missing space before round brace in export default function', function() {
            expect(checker.checkString('export default function(){}')).to.have.no.errors();
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunctionDeclaration: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc() {}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionDeclaration');
        });

        it('should not report missing space before curly brace in export default function', function() {
            expect(checker.checkString('export default function(){}')).to.have.no.errors();
        });
    });
});
