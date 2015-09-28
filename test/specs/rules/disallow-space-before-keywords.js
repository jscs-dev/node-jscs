var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal space before keyword', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });

        var errors = checker.checkString('if (true) {\n} else { x++; }');
        var error = errors.getErrorList()[0];

        expect(errors).to.have.one.validation.error.from('disallowSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Illegal space before "else" keyword');
    });

    it('should not report no space before keyword', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });

        expect(checker.checkString(
            'if (x) {\n' +
                'x++;\n' +
            '}else {\n' +
                'x--;\n' +
            '}'
        )).to.have.no.errors();
    });

    it('should not trigger error for comments', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });
        expect(checker.checkString('if (true) {\n} /**/else { x++; }')).to.have.no.errors();
    });

    it('should not report if tokens placed on different lines', function() {
        checker.configure({ disallowSpaceBeforeKeywords: true });
        expect(checker.checkString('x\nif (true) false')).to.have.no.errors();
    });

    it('should not report if there are no braces', function() {
        checker.configure({ disallowSpaceBeforeKeywords: true });
        expect(checker.checkString('if (true) x++;  else x--;')).to.have.no.errors();
    });

    it('should not report if preceding token is another keyword', function() {
        checker.configure({ disallowSpaceBeforeKeywords: true });
        expect(checker.checkString('function test() {return void(0);}')).to.have.no.errors();
    });

    it('should report on all possible ES3 keywords if a value of true is supplied', function() {
        checker.configure({ disallowSpaceBeforeKeywords: true });

        var errors = checker.checkString('if (true) {\n} else { x++; }');
        var error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('disallowSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Illegal space before "else" keyword');

        errors = checker.checkString('/**/ if (true) {\n} else { x++; }');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('disallowSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Illegal space before "else" keyword');

        errors = checker.checkString('do {\nx++;\n} while (x < 5)');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('disallowSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Illegal space before "while" keyword');

        errors = checker.checkString('try {\nx++;\n} catch (e) {}');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('disallowSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Illegal space before "catch" keyword');
    });
});
