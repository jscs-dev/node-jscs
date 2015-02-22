var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-curly-braces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing `if` braces', function() {
        checker.configure({ requireCurlyBraces: ['if'] });
        assert(checker.checkString('if (x) x++;').getErrorCount() === 1);
    });

    it('should not report `if` with braces', function() {
        checker.configure({ requireCurlyBraces: ['if'] });
        assert(checker.checkString('if (x) { x++; }').isEmpty());
    });

    it('should report missing `else` braces', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        assert(checker.checkString('if (x) x++; else x--;').getErrorCount() === 1);
    });

    it('should not report `else` with braces', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        assert(checker.checkString('if (x) x++; else { x--; }').isEmpty());
    });

    it('should report missing `while` braces', function() {
        checker.configure({ requireCurlyBraces: ['while'] });
        assert(checker.checkString('while (x) x++;').getErrorCount() === 1);
    });

    it('should not report `while` with braces', function() {
        checker.configure({ requireCurlyBraces: ['while'] });
        assert(checker.checkString('while (x) { x++; }').isEmpty());
    });

    it('should report missing `for` braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        assert(checker.checkString('for (;;) x++;').getErrorCount() === 1);
    });

    it('should not report `for` with braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        assert(checker.checkString('for (;;) { x++; }').isEmpty());
    });

    it('should report missing `for in` braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        assert(checker.checkString('for (i in z) x++;').getErrorCount() === 1);
    });

    it('should not report `for in` with braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        assert(checker.checkString('for (i in z) { x++; }').isEmpty());
    });

    it('should report missing `do` braces', function() {
        checker.configure({ requireCurlyBraces: ['do'] });
        assert(checker.checkString('do x++; while (x);').getErrorCount() === 1);
    });

    it('should not report `do` with braces', function() {
        checker.configure({ requireCurlyBraces: ['do'] });
        assert(checker.checkString('do { x++; } while (x);').isEmpty());
    });

    it('should report missing `case` braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 1:a=b;}').getErrorCount() === 1);
    });

    it('should report missing `case` braces, but not missing `default`', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 1:a=b;default:a=c;}').getErrorCount() === 1);
    });

    it('should not report `case` with braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 1:{a=b;}}').isEmpty());
    });

    it('should not report empty `case` with missing braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 0:case 1:{a=b;}}').isEmpty());
    });

    it('should report missing `default` braces', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        assert(checker.checkString('switch(x){default:a=b;}').getErrorCount() === 1);
    });

    it('should report missing `default` braces, but not missing `case`', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        assert(checker.checkString('switch(x){case 1:a=b;default:a=c;}').getErrorCount() === 1);
    });

    it('should not report `default` with braces', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        assert(checker.checkString('switch(x){default:{a=b;}}').isEmpty());
    });

    it('should report missing braces in `case` with expression', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(true){case x&&y:a=b;}').getErrorCount() === 1);
    });

    it('should report missing braces in `case` with more that one consequent statement', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 1:a=b;c=d;}').getErrorCount() === 1);
    });

    it('should not report missing braces in `case` with braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        assert(checker.checkString('switch(x){case 1:{a=b;c=d;}}').isEmpty());
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ requireCurlyBraces: ['catch'] });
        assert(checker.checkString('promise.catch()').isEmpty());
    });

    it('should report on all optionally curly braced keywords if a value of true is supplied', function() {
        checker.configure({ requireCurlyBraces: true });

        assert(!checker.checkString('if (x) x++;').isEmpty());
        assert(!checker.checkString('if (x) {x++} else x--;').isEmpty());
        assert(!checker.checkString('for (x = 0; x < 10; x++) x++;').isEmpty());
        assert(!checker.checkString('while (x) x++;').isEmpty());
        assert(!checker.checkString('do x++; while(x < 5);').isEmpty());
        assert(!checker.checkString('try {x++;} catch(e) throw e;').isEmpty());
        assert(!checker.checkString('switch(\'4\'){ case \'4\': break; }').isEmpty());
        assert(!checker.checkString('switch(\'4\'){ case \'4\': {break;} default: 1; }').isEmpty());
        assert(!checker.checkString('with(x) console.log(toString());').isEmpty());
    });

    it('should correctly set pointer (#799)', function() {
        checker.configure({ requireCurlyBraces: ['else'] });

        // jscs:disable
        var error = checker.checkString(function foo() {
            if (foo === 1)
                return 1;
            else
                return 3;
        }.toString()).getErrorList()[ 0 ];
        // jscs:enable

        assert(error.line === 4);
        assert(error.column === 12);
    });

    it('should not report missing `else` braces for `else if`', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        assert(checker.checkString('if (x) { x++; } else if (x) { x++; }').isEmpty());
    });
});
