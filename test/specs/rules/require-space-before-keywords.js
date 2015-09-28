var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing space before keyword', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });

        var errors = checker.checkString('if (true) {\n}else { x++; }');
        var error = errors.getErrorList()[0];

        expect(errors).to.have.one.validation.error.from('requireSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Missing space before "else" keyword');
    });

    it('should not report space before keyword', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });

        expect(checker.checkString(
            'if (x) {\n' +
                'x++;\n' +
            '} else {\n' +
                'x--;\n' +
            '}'
        )).to.have.no.errors();
    });

    it('should not report space before non-coddled keywords', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['while'] });

        expect(checker.checkString(
            'while (x < 5) {\n' +
                'x++;\n' +
            '}'
        )).to.have.no.errors();
    });

    it('should not trigger error for comments', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });
        expect(checker.checkString('if (true) {\n} /**/ else { x++; }')).to.have.no.errors();
    });

    it('should not trigger error for different lines', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });
        expect(checker.checkString('if (true) {\n} /**/ \nelse { x++; }')).to.have.no.errors();
    });

    it('should not report if there are no braces', function() {
        checker.configure({ requireSpaceBeforeKeywords: true });
        expect(checker.checkString('if (true) x++;else x--;')).to.have.no.errors();
    });

    it('should report on all possible ES3 keywords if a value of true is supplied', function() {
        checker.configure({ requireSpaceBeforeKeywords: true });

        var errors = checker.checkString('if (true) {\n}else { x++; }');
        var error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('requireSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Missing space before "else" keyword');

        errors = checker.checkString('/**/if (true) {\n}else { x++; }');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('requireSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Missing space before "else" keyword');

        errors = checker.checkString('do {\nx++;\n}while (x < 5)');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('requireSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Missing space before "while" keyword');

        errors = checker.checkString('try {\nx++;\n}catch (e) {}');
        error = errors.getErrorList()[0];
        expect(errors).to.have.one.validation.error.from('requireSpaceBeforeKeywords');
        expect(errors.explainError(error)).to.have.string('Missing space before "catch" keyword');
    });
});
