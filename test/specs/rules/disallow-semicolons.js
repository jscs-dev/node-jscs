var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-semicolons', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSemicolons: true });
    });

    it('should not allow semicolons at end of line', function() {
        expect(checker.checkString([
            'var a = 1;',
            'var b = 2;',
            'function c() {}',
            'd();'
        ].join('\n'))).to.have.error.count.which.equals(3);
    });

    it('should allow semicolons inline', function() {
        expect(checker.checkString([
            'for (var i = 0; i < l; i++) {',
            'go()',
            '}'
        ].join('\n'))).to.have.no.errors();
    });

    it('should allow semicolons at start of line', function() {
        expect(checker.checkString([
            'var foo = function () {}',
            ';[1, 2].forEach(foo)'
        ].join('\n'))).to.have.no.errors();
    });

    it('should not autofix semicolons', function() {
        var input = 'var a = 1;\nvar b = 1;';
        var result = checker.fixString(input);
        expect(result.output).to.equal(input);
        expect(result.errors.getValidationErrorCount()).to.equal(2);
    });
});
