var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/maximum-number-of-lines', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('number option', function() {
        beforeEach(function() {
            checker.configure({ maximumNumberOfLines: 2 });
        });

        it('should report a number of lines longer than the maximum', function() {
            expect(checker.checkString('var xyz;\nvar xyz;\nvar xyz;'))
              .to.have.one.validation.error.from('maximumNumberOfLines');
        });

        it('should not report a number of lines equal to the maximum', function() {
            expect(checker.checkString('var xy;\nvar xy;')).to.have.no.errors();
        });

        it('should not report a number of lines shorter than the maximum', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });
    });
});
