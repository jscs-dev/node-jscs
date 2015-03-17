var Checker = require('../../../lib/checker');
var assert = require('assert');

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
            assert(checker.checkString(
                'var x = foo.\n' +
                '   on();\n'
            ).isEmpty());
        });

        it('should report unspecified operators', function() {
            assert(checker.checkString(
                'var x = foo +\n' +
                '   on();\n'
            ).getErrorCount() === 1);
        });
    });

    it('should report when mixed dot operators used', function() {
        assert(checker.checkString(
            'var x = foo\n' +
            '   .items[5]\n' +
            '   .on()\n' +
            '   on().\n' +
            '   on();\n'
        ).getErrorCount() === 1);
    });

    it('should report when 2 character binary operators used before line break', function() {
        assert(checker.checkString(
            'var x = foo &&\n' +
            '   bar ||\n' +
            '   test *\n' +
            '   4;\n'
        ).getErrorCount() === 3);
    });

    it('should report twice when two cases of dot operators used incorrectly', function() {
        assert(checker.checkString(
            '$el.on( "click", fn ).\n' +
            '   on()\n' +
            '   .on()\n' +
            '   on().\n' +
            '   on();\n'
        ).getErrorCount() === 2);
    });

    it('should not report when dot operators used on a single line', function() {
        assert(checker.checkString('var y = $foo.bar().test();').isEmpty());
    });

    it('should not report when dot operator used correctly on new line', function() {
        assert(checker.checkString(
            'var x = foo\n' +
            '   .on();\n'
        ).isEmpty());
    });

    it('should not report when dot operator used with variable accessors correctly on new line', function() {
        assert(checker.checkString(
            'a.b\n' +
            '   .c();\n'
        ).isEmpty());
    });

    it('should report on period at end of line', function() {
        assert(checker.checkString(
            'var x = foo.\n' +
            '   on();\n'
        ).getErrorCount() === 1);
    });

    it('should report when dot operators not carried over to next line when accessing variables', function() {
        assert(checker.checkString(
            'a.b.\n' +
            '   c()'
        ).getErrorCount() === 1);
    });

    it('should report an error when dots used on either side', function() {
        assert(checker.checkString(
            'var x = foo\n' +
            '   .on().\n' +
            '   on();\n'
        ).getErrorCount() === 1);
    });

    it('should report errors every time any of the other operators are followed by a line break', function() {
        assert(checker.checkString(
            'var x = 1 + 2 +\n' +
            '   3 + 4 + 5 + 6 /\n' +
            '   7 + 8 + 9 *\n' +
            '   10 + 11 +\n' +
            '   12;\n'
        ).getErrorCount() === 4);
    });

    it('should not report errors if operators begin after a line break', function() {
        assert(checker.checkString(
            'var x = 1 + 2\n' +
            '   + 3 + 4 + 5 + 6\n' +
            '   / 7 + 8 + 9\n' +
            '   * 10 + 11\n' +
            '   + 12;\n'
        ).getErrorCount() === 0);
    });
});
