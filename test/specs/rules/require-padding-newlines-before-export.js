var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-padding-newlines-before-export', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewLinesBeforeExport: true });
        });

        it('should report missing padding before export', function() {
            expect(checker.checkString('var a = 2;\nmodule.exports = a;'))
              .to.have.one.validation.error.from('requirePaddingNewLinesBeforeExport');
        });

        it('should not report missing padding if first line', function() {
            expect(checker.checkString('module.exports = 2;')).to.have.no.errors();
        });

        it('should not report padding before export', function() {
            expect(checker.checkString('var a = 2;\n\nmodule.exports = a;')).to.have.no.errors();
        });

        it('should not report lack of padding before object assignment', function() {
            expect(checker.checkString('var a = 2;\nfoo.exports = a;')).to.have.no.errors();
            expect(checker.checkString('var a = 2;\nmodule.foo = a;')).to.have.no.errors();
        });

        it('should not report missing padding if export is only statement in block', function() {
            expect(checker.checkString('if (true) {\nmodule.exports = a;\n}')).to.have.no.errors();
        });
    });
});
