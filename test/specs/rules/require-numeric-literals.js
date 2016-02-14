var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-numeric-literals', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireNumericLiterals: true
        });
    });

    it('should report on use of parseInt using 2, 8, 16 radix', function() {
        expect(checker.checkString('parseInt("111110111", 2) === 503;'))
          .to.have.one.validation.error.from('requireNumericLiterals');
        expect(checker.checkString('parseInt("767", 8) === 503;'))
          .to.have.one.validation.error.from('requireNumericLiterals');
        expect(checker.checkString('parseInt("1F7", 16) === 255;'))
          .to.have.one.validation.error.from('requireNumericLiterals');
        expect(checker.checkString('parseInt(1, 2);')).to.have.one.validation.error.from('requireNumericLiterals');
    });

    it('should not report on use of parseInt with radix that is not 2, 8, 16', function() {
        expect(checker.checkString('parseInt(1);')).to.have.no.errors();
        expect(checker.checkString('parseInt(1, 3);')).to.have.no.errors();
    });

    it('should not report on numeric literals', function() {
        expect(checker.checkString('0b111110111 === 503;')).to.have.no.errors();
        expect(checker.checkString('0o767 === 503;')).to.have.no.errors();
        expect(checker.checkString('0x1F7 === 503;')).to.have.no.errors();
    });

    it('should not report on other call expressions', function() {
        expect(checker.checkString('a();')).to.have.no.errors();
        expect(checker.checkString('a(1);')).to.have.no.errors();
        expect(checker.checkString('a(1, 2);')).to.have.no.errors();
    });

    it('should not report for non-identifier call', function() {
        expect(checker.checkString('a[parseInt](1,2);')).to.have.no.errors();
    });

    it('should not report on use of parseInt with an identifier for string', function() {
        expect(checker.checkString('parseInt(foo);')).to.have.no.errors();
        expect(checker.checkString('parseInt(foo, 2);')).to.have.no.errors();
    });
});
