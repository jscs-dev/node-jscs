var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-numeric-literals', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            esnext: true,
            requireNumericLiterals: true
        });
    });

    it('should report on use of parseInt using 2, 8, 16 radix', function() {
        assert(checker.checkString('parseInt("111110111", 2) === 503;').getErrorCount() === 1);
        assert(checker.checkString('parseInt("767", 8) === 503;').getErrorCount() === 1);
        assert(checker.checkString('parseInt("1F7", 16) === 255;').getErrorCount() === 1);
        assert(checker.checkString('parseInt(1, 2);').getErrorCount() === 1);
    });

    it('should not report on use of parseInt with radix that is not 2, 8, 16', function() {
        assert(checker.checkString('parseInt(1);').isEmpty());
        assert(checker.checkString('parseInt(1, 3);').isEmpty());
    });

    it('should not report on numeric literals', function() {
        assert(checker.checkString('0b111110111 === 503;').isEmpty());
        assert(checker.checkString('0o767 === 503;').isEmpty());
        assert(checker.checkString('0x1F7 === 503;').isEmpty());
    });

    it('should not report on other call expressions', function() {
        assert(checker.checkString('a();').isEmpty());
        assert(checker.checkString('a(1);').isEmpty());
        assert(checker.checkString('a(1, 2);').isEmpty());
    });
});
