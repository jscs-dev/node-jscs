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

    describe('object option', function() {

        it('should not report if a number of lines equal to the maximum when allExcept["comments"] is set', function() {
            checker.configure({
                maximumNumberOfLines: {
                    value: 2,
                    allExcept: ['comments']
                }
            });
            var content = [
                '//a single line comment',
                'var xy;',
                'var xy;',
                '/* a multiline',
                ' long comment*/'
            ].join('\n');
            expect(checker.checkString(content)).to.have.no.errors();
        });

        it('should report a number of non-commented lines equal to the maximum', function() {
            checker.configure({
                maximumNumberOfLines: {
                    value: 2
                }
            });
            expect(checker.checkString('/* a multiline comment\n that goes to many lines*/\nvar xy;\nvar xy;'))
              .to.have.one.validation.error.from('maximumNumberOfLines');
            expect(checker.checkString('//a single line comment\nvar xy;\nvar xy;'))
              .to.have.one.validation.error.from('maximumNumberOfLines');
        });

    });

});
