var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-spaces-in-for-statement', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true option', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInForStatement: true });
        });

        it('should report missing spaces in for statement in both cases', function() {
            expect(checker.checkString('for(i=0;i<l;i++){}')).to.have.error.count.equal(2);
        });

        it('should report missing spaces in for statement before test statement', function() {
            expect(checker.checkString('for(i=0; i<l;i++){}'))
              .to.have.one.validation.error.from('requireSpacesInForStatement');
        });

        it('should report missing spaces in for statement behind test statement', function() {
            expect(checker.checkString('for(i=0;i<l; i++){}'))
              .to.have.one.validation.error.from('requireSpacesInForStatement');
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('for(i=0; i<l; i++){}')).to.have.no.errors();
        });

        it('should report even without init', function() {
            expect(checker.checkString('for(;i<l; i++){}'))
              .to.have.one.validation.error.from('requireSpacesInForStatement');
        });

        it('should report even without test', function() {
            expect(checker.checkString('for(i=0; ;i++){}'))
              .to.have.one.validation.error.from('requireSpacesInForStatement');
        });

        it('should report even without update', function() {
            expect(checker.checkString('for(i=0;i<l;){}'))
              .to.have.one.validation.error.from('requireSpacesInForStatement');
        });

        it('should not report with spaces with parenthesizedExpression #1332', function() {
            var parenthesizedExpression = 'for (var i = 0; (!reachEnd && (i < elementsToMove)); i++) {}';
            expect(checker.checkString(parenthesizedExpression)).to.have.no.errors();
        });
    });
});
