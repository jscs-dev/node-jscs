var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-capitalized-constructors-new', function() {
    var checker;

    function baseCases() {
        it('should report capitalized constructors without the "new" keyword', function() {
            expect(checker.checkString('var x = Y();'))
              .to.have.one.validation.error.from('requireCapitalizedConstructorsNew');
        });

        it('should not report capitalized construction', function() {
            expect(checker.checkString('var x = new Y();')).to.have.no.errors();
        });

        it('should not report member expression construction', function() {
            expect(checker.checkString('var x = ns.Y();')).to.have.no.errors();
        });

        it('should not report lowercase function calls', function() {
            expect(checker.checkString('var x = y();')).to.have.no.errors();
        });
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with `true` value', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedConstructorsNew: true });
        });

        baseCases();
    });

    describe('with `allExcept` value', function() {
        beforeEach(function() {
            checker.configure({
                requireCapitalizedConstructorsNew: {
                    allExcept: ['SomethingNative']
                }
            });
        });

        baseCases();

        it('should not report exempted construction', function() {
            expect(checker.checkString('var x = SomethingNative();')).to.have.no.errors();
        });
    });
});
