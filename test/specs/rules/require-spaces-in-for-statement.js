var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-spaces-in-for-statement', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('true option', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInForStatement: true });
        });

        it('should report missing spaces in for statement in both cases', function() {
            expect(checker.checkString('for(i=0;i<l;i++){}')).to.have.validation.error.count.which.equals(2);
        });

        it('should report missing spaces in for statement before test statement', function() {
            expect(checker.checkString('for(i=0; i<l;i++){}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing spaces in for statement behind test statement', function() {
            expect(checker.checkString('for(i=0;i<l; i++){}'))
                .to.have.one.error.from('ruleName');
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('for(i=0; i<l; i++){}')).to.have.no.errors();
        });

        it('should report even without init', function() {
            expect(checker.checkString('for(;i<l; i++){}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report even without test', function() {
            expect(checker.checkString('for(i=0; ;i++){}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report even without update', function() {
            expect(checker.checkString('for(i=0;i<l;){}'))
                .to.have.one.error.from('ruleName');
        });
    });
});
