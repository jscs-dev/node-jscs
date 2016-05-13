var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var getPosition = require('../../../lib/errors').getPosition;

describe('rules/require-curly-braces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing `if` braces', function() {
        checker.configure({ requireCurlyBraces: ['if'] });
        expect(checker.checkString('if (x) x++;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `if` with braces', function() {
        checker.configure({ requireCurlyBraces: ['if'] });
        expect(checker.checkString('if (x) { x++; }')).to.have.no.errors();
    });

    it('should report missing `else` braces', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        expect(checker.checkString('if (x) x++; else x--;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `else` with braces', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        expect(checker.checkString('if (x) x++; else { x--; }')).to.have.no.errors();
    });

    it('should report missing `while` braces', function() {
        checker.configure({ requireCurlyBraces: ['while'] });
        expect(checker.checkString('while (x) x++;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `while` with braces', function() {
        checker.configure({ requireCurlyBraces: ['while'] });
        expect(checker.checkString('while (x) { x++; }')).to.have.no.errors();
    });

    it('should report missing `for` braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (;;) x++;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `for` with braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (;;) { x++; }')).to.have.no.errors();
    });

    it('should report missing `for in` braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (i in z) x++;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `for in` with braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (i in z) { x++; }')).to.have.no.errors();
    });

    it('should report missing `for of` braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (i of z) x++;')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `for of` with braces', function() {
        checker.configure({ requireCurlyBraces: ['for'] });
        expect(checker.checkString('for (i of z) { x++; }')).to.have.no.errors();
    });

    it('should report missing `do` braces', function() {
        checker.configure({ requireCurlyBraces: ['do'] });
        expect(checker.checkString('do x++; while (x);')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `do` with braces', function() {
        checker.configure({ requireCurlyBraces: ['do'] });
        expect(checker.checkString('do { x++; } while (x);')).to.have.no.errors();
    });

    it('should report missing `case` braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 1:a=b;}')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should report missing `case` braces, but not missing `default`', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 1:a=b;default:a=c;}'))
          .to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `case` with braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 1:{a=b;}}')).to.have.no.errors();
    });

    it('should not report empty `case` with missing braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 0:case 1:{a=b;}}')).to.have.no.errors();
    });

    it('should report missing `default` braces', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        expect(checker.checkString('switch(x){default:a=b;}')).to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should report missing `default` braces, but not missing `case`', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        expect(checker.checkString('switch(x){case 1:a=b;default:a=c;}'))
          .to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report `default` with braces', function() {
        checker.configure({ requireCurlyBraces: ['default'] });
        expect(checker.checkString('switch(x){default:{a=b;}}')).to.have.no.errors();
    });

    it('should report missing braces in `case` with expression', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(true){case x&&y:a=b;}'))
          .to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should report missing braces in `case` with more that one consequent statement', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 1:a=b;c=d;}'))
          .to.have.one.validation.error.from('requireCurlyBraces');
    });

    it('should not report missing braces in `case` with braces', function() {
        checker.configure({ requireCurlyBraces: ['case'] });
        expect(checker.checkString('switch(x){case 1:{a=b;c=d;}}')).to.have.no.errors();
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ requireCurlyBraces: ['catch'] });
        expect(checker.checkString('promise.catch()')).to.have.no.errors();
    });

    it('should report on all optionally curly braced keywords if a value of true is supplied', function() {
        checker.configure({ requireCurlyBraces: true });

        expect(checker.checkString('if (x) x++;')).to.have.errors();
        expect(checker.checkString('if (x) {x++} else x--;')).to.have.errors();
        expect(checker.checkString('for (x = 0; x < 10; x++) x++;')).to.have.errors();
        expect(checker.checkString('while (x) x++;')).to.have.errors();
        expect(checker.checkString('do x++; while(x < 5);')).to.have.errors();
        expect(checker.checkString('try {x++;} catch(e) throw e;')).to.have.errors();
        expect(checker.checkString('switch(\'4\'){ case \'4\': break; }')).to.have.errors();
        expect(checker.checkString('switch(\'4\'){ case \'4\': {break;} default: 1; }')).to.have.errors();
        expect(checker.checkString('with(x) console.log(toString());')).to.have.errors();
    });

    it('should correctly set pointer (#799)', function() {
        checker.configure({ requireCurlyBraces: ['else'] });

        var error = checker.checkString([
            'function a() {',
            'if (foo === 1)',
            '    return 1;',
            'else ',
            '   return 3;',
            '}'
        ].join('\n')).getErrorList()[ 0 ];

        expect(getPosition(error).column).to.equal(2);
        expect(getPosition(error).line).to.equal(4);
    });

    it('should not report missing `else` braces for `else if`', function() {
        checker.configure({ requireCurlyBraces: ['else'] });
        expect(checker.checkString('if (x) { x++; } else if (x) { x++; }')).to.have.no.errors();
    });

    describe('option with exceptions', function() {
        it('should report on if and else', function() {
            checker.configure({
                requireCurlyBraces: {
                    allExcept: ['return', 'break', 'continue'],
                    keywords: true
                }
            });

            expect(checker.checkString('if (x) x++;')).to.have.errors();
            expect(checker.checkString('if (x) {x++} else x--;')).to.have.errors();
            expect(checker.checkString('for (x = 0; x < 10; x++) x++;')).to.have.errors();
            expect(checker.checkString('while (x) x++;')).to.have.errors();
            expect(checker.checkString('do x++; while(x < 5);')).to.have.errors();
            expect(checker.checkString('try {x++;} catch(e) throw e;')).to.have.errors();
            expect(checker.checkString('switch(\'4\'){ case \'4\': break; }')).to.have.errors();
            expect(checker.checkString('switch(\'4\'){ case \'4\': {break;} default: 1; }')).to.have.errors();
            expect(checker.checkString('with(x) console.log(toString());')).to.have.errors();
        });

        it('should report on if and else', function() {
            checker.configure({
                requireCurlyBraces: {
                    allExcept: ['return', 'break', 'continue'],
                    keywords: ['if', 'else']
                }
            });

            expect(checker.checkString('function a() { if (x) x++; }')).to.have.errors();
            expect(checker.checkString('function a() { if (x) {x++} else x--; }')).to.have.errors();
        });

        it('should not report on if and else with exceptions', function() {
            checker.configure({
                requireCurlyBraces: {
                    allExcept: ['return', 'break', 'continue'],
                    keywords: ['if', 'else']
                }
            });

            expect(checker.checkString('function a() { if (x) return; }')).to.have.no.errors();
            expect(checker.checkString('function a() { if (x) return; else return; }')).to.have.no.errors();
        });
    });
});
