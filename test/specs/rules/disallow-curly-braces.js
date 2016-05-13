var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var getPosition = require('../../../lib/errors').getPosition;

describe('rules/disallow-curly-braces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not report missing `if` braces', function() {
        checker.configure({ disallowCurlyBraces: ['if'] });
        expect(checker.checkString('if (x) x++;')).to.have.no.errors();
    });

    it('should report `if` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['if'] });
        expect(checker.checkString('if (x) { x++; }')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `else` braces', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });
        expect(checker.checkString('if (x) x++; else x--;')).to.have.no.errors();
    });

    it('should report `else` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });
        expect(checker.checkString('if (x) x++; else { x--; }'))
          .to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `while` braces', function() {
        checker.configure({ disallowCurlyBraces: ['while'] });
        expect(checker.checkString('while (x) x++;')).to.have.no.errors();
    });

    it('should report `while` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['while'] });
        expect(checker.checkString('while (x) { x++; }')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `for` braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (;;) x++;')).to.have.no.errors();
    });

    it('should report `for` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (;;) { x++; }')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `for in` braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (i in z) x++;')).to.have.no.errors();
    });

    it('should report `for in` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (i in z) { x++; }')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `for of` braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (i of z) x++;')).to.have.no.errors();
    });

    it('should report `for of` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['for'] });
        expect(checker.checkString('for (i of z) { x++; }')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report missing `do` braces', function() {
        checker.configure({ disallowCurlyBraces: ['do'] });
        expect(checker.checkString('do x++; while (x);')).to.have.no.errors();
    });

    it('should report `do` with braces', function() {
        checker.configure({ disallowCurlyBraces: ['do'] });
        expect(checker.checkString('do { x++; } while (x);')).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ disallowCurlyBraces: ['catch'] });
        expect(checker.checkString('promise.catch()')).to.have.no.errors();
    });

    it('should report on all optionally curly braced keywords if a value of true is supplied', function() {
        checker.configure({ disallowCurlyBraces: true });

        expect(checker.checkString('if (x) {x++;}')).to.have.errors();
        expect(checker.checkString('if (x) x++; else {x--;}')).to.have.errors();
        expect(checker.checkString('for (x = 0; x < 10; x++) {x++;}')).to.have.errors();
        expect(checker.checkString('while (x) {x++;}')).to.have.errors();
        expect(checker.checkString('do {x++;} while(x < 5);')).to.have.errors();
        // expect(checker.checkString('with(x) {console.log(toString());}')).to.have.errors();
    });

    it('should correctly set pointer (#799)', function() {
        checker.configure({ disallowCurlyBraces: ['else'] });

        var error = checker.checkString([
            'function a() {',
            'if (foo === 1)',
            '    return 1;',
            'else {',
            '   return 3;',
            '}',
            '}'
        ].join('\n')).getErrorList()[ 0 ];

        expect(getPosition(error).column).to.equal(5);
        expect(getPosition(error).line).to.equal(4);
    });

    it('should report for a block with 1 statement', function() {
        checker.configure({ disallowCurlyBraces: true });

        expect(checker.checkString([
        'if (x) {',
            'a();',
        '}'
        ].join('\n'))).to.have.one.validation.error.from('disallowCurlyBraces');
    });

    it('should not report for a block with 2 statements', function() {
        checker.configure({ disallowCurlyBraces: true });

        expect(checker.checkString([
        'if (x) {',
            'a();',
            'b();',
        '}'
        ].join('\n'))).to.have.no.errors();
    });

    it('should not report for a block with 3 statements', function() {
        checker.configure({ disallowCurlyBraces: true });

        expect(checker.checkString([
        'if (x) {',
            'a();',
            'b();',
            'c();',
        '}'
        ].join('\n'))).to.have.no.errors();
    });

    it('should report for a block with 3 lines that is a single statement', function() {
        checker.configure({ disallowCurlyBraces: true });

        expect(checker.checkString([
        'if (a) {',
            'a = [',
                '\'b\'',
            '];',
        '}'
        ].join('\n'))).to.have.one.validation.error.from('disallowCurlyBraces');
    });
});
