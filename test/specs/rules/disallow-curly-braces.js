var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-curly-braces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not report missing `if` braces', function() {
        checker.configure({ disallowCurlyBraces: ['if'] });
        assert(checker.checkString('if (x) x++;').isEmpty());
    });

    it('should report `if` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['if'] });
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });

    it('should not report missing `else` braces', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });
        assert(checker.checkString('if (x) x++; else x--;').isEmpty());
    });

    it('should report `else` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });
        assert(checker.checkString('if (x) x++; else { x--; }').getErrorCount() === 1);
    });

    it('should not report missing `while` braces', function() {
        checker.configure({ disallowCurlyBraces: ['while'] });
        assert(checker.checkString('while (x) x++;').isEmpty());
    });

    it('should report `while` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['while'] });
        assert(checker.checkString('while (x) { x++; }').getErrorCount() === 1);
    });

    it('should not report missing `for` braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        assert(checker.checkString('for (;;) x++;').isEmpty());
    });

    it('should report `for` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        assert(checker.checkString('for (;;) { x++; }').getErrorCount() === 1);
    });

    it('should not report missing `for in` braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        assert(checker.checkString('for (i in z) x++;').isEmpty());
    });

    it('should report `for in` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        assert(checker.checkString('for (i in z) { x++; }').getErrorCount() === 1);
    });

    it('should not report missing `do` braces', function() {
        checker.configure({ disallowCurlyBraces: ['do'] });
        assert(checker.checkString('do x++; while (x);').isEmpty());
    });

    it('should report `do` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['do'] });
        assert(checker.checkString('do { x++; } while (x);').getErrorCount() === 1);
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ disallowCurlyBraces: ['catch'] });
        assert(checker.checkString('promise.catch()').isEmpty());
    });

    it('should report on all optionally curly braced keywords if a value of true is supplied', function() {
        checker.configure({ disallowCurlyBraces: true });

        assert(!checker.checkString('if (x) {x++;}').isEmpty());
        assert(!checker.checkString('if (x) x++; else {x--;}').isEmpty());
        assert(!checker.checkString('for (x = 0; x < 10; x++) {x++;}').isEmpty());
        assert(!checker.checkString('while (x) {x++;}').isEmpty());
        assert(!checker.checkString('do {x++;} while(x < 5);').isEmpty());
        assert(!checker.checkString('with(x) {console.log(toString());}').isEmpty());
    });

    it('should correctly set pointer (#799)', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });

        var error = checker.checkString(
            'if (foo === 1)\n' +
            '    return 1;\n' +
            'else {\n' +
            '   return 3;\n' +
            '}'
        ).getErrorList()[ 0 ];

        assert(error.line === 3);
        assert(error.column === 0);
    });

    it('should report for a block with 1 statement', function() {
        checker.configure({ disallowCurlyBraces: true });

        assert(checker.checkString([
        'if (x) {',
            'a();',
        '}'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should not report for a block with 2 statements', function() {
        checker.configure({ disallowCurlyBraces: true });

        assert(checker.checkString([
        'if (x) {',
            'a();',
            'b();',
        '}'
        ].join('\n')).isEmpty());
    });

    it('should not report for a block with 3 statements', function() {
        checker.configure({ disallowCurlyBraces: true });

        assert(checker.checkString([
        'if (x) {',
            'a();',
            'b();',
            'c();',
        '}'
        ].join('\n')).isEmpty());
    });

    it('should report for a block with 3 lines that is a single statement', function() {
        checker.configure({ disallowCurlyBraces: true });

        assert(checker.checkString([
        'if (a) {',
            'a = [',
                '\'b\'',
            '];',
        '}'
        ].join('\n')).getErrorCount() === 1);
    });
});
