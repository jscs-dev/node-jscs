var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-capitalized-constructors', function() {
    var checker;

    function baseCases() {
        it('should report uncapitalized construction', function() {
            expect(checker.checkString('var x = new y();'))
                .to.have.one.error.from('ruleName');
        });

        it('should not report capitalized construction', function() {
            expect(checker.checkString('var x = new Y();')).to.have.no.errors();
        });

        it('should not report member expression construction', function() {
            expect(checker.checkString('var x = new ns.y();')).to.have.no.errors();
        });

        it('should not report construction with "this" keyword', function() {
            expect(checker.checkString('var x = new this();')).to.have.no.errors();
        });
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('with `true` value', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedConstructors: true });
        });

        baseCases();
    });

    describe.skip('with `allExcept` value', function() {
        beforeEach(function() {
            checker.configure({
                requireCapitalizedConstructors: {
                    allExcept: ['somethingNative']
                }
            });
        });

        baseCases();

        it('should not report exempted construction', function() {
            expect(checker.checkString('var x = new somethingNative();')).to.have.no.errors();
        });
    });
});
