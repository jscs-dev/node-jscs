var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-padding-newlines-before-export', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewLinesBeforeExport: true });
        });

        it('should not report no padding before export', function() {
            expect(checker.checkString('var a = 2;\nmodule.exports = a;')).to.have.no.errors();
        });

        it('should not report missing padding if first line', function() {
            expect(checker.checkString('module.exports = 2;')).to.have.no.errors();
        });

        it('should report padding before export', function() {
            expect(checker.checkString('var a = 2;\n\nmodule.exports = a;'))
              .to.have.one.validation.error.from('disallowPaddingNewLinesBeforeExport');
        });

        it('should not report comment before export', function() {
            expect(checker.checkString('var a = 2;\n// foo\nmodule.exports = a;')).to.have.no.errors();
        });

        it('should not report comment with extra padding before export', function() {
            expect(checker.checkString('var a = 2;\n\n// foo\nmodule.exports = a;')).to.have.no.errors();
        });

        it('should not report padding before object assignment', function() {
            expect(checker.checkString('var a = 2;\n\nfoo.exports = a;')).to.have.no.errors();
            expect(checker.checkString('var a = 2;\n\nmodule.foo = a;')).to.have.no.errors();
        });

        it('should not report if it is not a property assignment', function() {
            expect(checker.checkString('var a = 2;\n\nfoo = a;')).to.have.no.errors();
        });
    });
});
