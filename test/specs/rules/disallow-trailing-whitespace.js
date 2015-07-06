var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-trailing-whitespace', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: true });
        });

        it('should report trailing spaces', function() {
            expect(checker.checkString('var x; '))
            .to.have.one.error.from('ruleName');
        });

        it('should report trailing tabs', function() {
            expect(checker.checkString('var x;\t'))
            .to.have.one.error.from('ruleName');
        });

        it('should report trailing whitespace on empty lines', function() {
            expect(checker.checkString('if(a){\n\tb=c;\n\t\n}'))
            .to.have.one.error.from('ruleName');
        });

        it('should report once for each line', function() {
            assert(checker.checkString('var x;\t\nvar y;\t').getValidationErrorCount() === 2);
        });

        it('should not report multiline strings with trailing whitespace', function() {
            expect(checker.checkString('var x = \' \\\n \';')).to.have.no.errors();
        });

        it('should not report when there is no trailing whitespace', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });
    });

    describe.skip('ignoreEmptyLines', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: 'ignoreEmptyLines' });
        });

        it('should not report trailing whitespace on empty lines', function() {
            expect(checker.checkString('if(a){\n\tb=c;\n\t\n}')).to.have.no.errors();
        });
    });

});
