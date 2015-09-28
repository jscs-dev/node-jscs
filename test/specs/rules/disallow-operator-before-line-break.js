var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-operator-before-line-break', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowOperatorBeforeLineBreak: true });
    });

    describe('array option', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ disallowOperatorBeforeLineBreak: ['+'] });
        });

        it('should not report unspecified operators', function() {
            expect(checker.checkString(
                'var x = foo.\n' +
                '   on();\n'
            )).to.have.no.errors();
        });

        it('should report unspecified operators', function() {
            expect(checker.checkString(
                'var x = foo +\n' +
                '   on();\n'
            )).to.have.one.validation.error.from('disallowOperatorBeforeLineBreak');
        });
    });

    it('should report when mixed dot operators used', function() {
        expect(checker.checkString(
            'var x = foo\n' +
            '   .items[5]\n' +
            '   .on()\n' +
            '   on().\n' +
            '   on();\n'
        )).to.have.one.validation.error.from('disallowOperatorBeforeLineBreak');
    });

    it('should report when 2 character binary operators used before line break', function() {
        expect(checker.checkString(
            'var x = foo &&\n' +
            '   bar ||\n' +
            '   test *\n' +
            '   4;\n'
        )).to.have.error.count.equal(3);
    });

    it('should report twice when two cases of dot operators used incorrectly', function() {
        expect(checker.checkString(
            '$el.on( "click", fn ).\n' +
            '   on()\n' +
            '   .on()\n' +
            '   on().\n' +
            '   on();\n'
        )).to.have.error.count.equal(2);
    });

    it('should not report when dot operators used on a single line', function() {
        expect(checker.checkString('var y = $foo.bar().test();')).to.have.no.errors();
    });

    it('should not report when dot operator used correctly on new line', function() {
        expect(checker.checkString(
            'var x = foo\n' +
            '   .on();\n'
        )).to.have.no.errors();
    });

    it('should not report when dot operator used with variable accessors correctly on new line', function() {
        expect(checker.checkString(
            'a.b\n' +
            '   .c();\n'
        )).to.have.no.errors();
    });

    it('should report on period at end of line', function() {
        expect(checker.checkString(
            'var x = foo.\n' +
            '   on();\n'
        )).to.have.one.validation.error.from('disallowOperatorBeforeLineBreak');
    });

    it('should report when dot operators not carried over to next line when accessing variables', function() {
        expect(checker.checkString(
            'a.b.\n' +
            '   c()'
        )).to.have.one.validation.error.from('disallowOperatorBeforeLineBreak');
    });

    it('should report an error when dots used on either side', function() {
        expect(checker.checkString(
            'var x = foo\n' +
            '   .on().\n' +
            '   on();\n'
        )).to.have.one.validation.error.from('disallowOperatorBeforeLineBreak');
    });

    it('should report errors every time any of the other operators are followed by a line break', function() {
        expect(checker.checkString(
            'var x = 1 + 2 +\n' +
            '   3 + 4 + 5 + 6 /\n' +
            '   7 + 8 + 9 *\n' +
            '   10 + 11 +\n' +
            '   12;\n'
        )).to.have.error.count.equal(4);
    });

    it('should not report errors if operators begin after a line break', function() {
        expect(checker.checkString(
            'var x = 1 + 2\n' +
            '   + 3 + 4 + 5 + 6\n' +
            '   / 7 + 8 + 9\n' +
            '   * 10 + 11\n' +
            '   + 12;\n'
        )).to.have.no.errors();
    });
});
