var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-preceding-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePrecedingComma: true });
    });

        it('should report succeeding comma', function() {
            assert(checker.checkString(
                'var x = { a : 1,\n' +
                    'b: 2 };'
            ).getErrorCount() === 1);
            assert(checker.checkString(
                'var x = 1,\n' +
                'y = 2,\n' +
                'z = 1;'
            ).getErrorCount() === 2);
        });

        it('should not report preceding comma', function() {
            assert(checker.checkString('var x = { a : 1\n, b: 2 };').isEmpty());
            assert(checker.checkString('var x = 1\n, y = 2').isEmpty());
        });
});
