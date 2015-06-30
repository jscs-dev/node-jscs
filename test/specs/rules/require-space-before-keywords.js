var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-space-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing space before keyword', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });

        var errors = checker.checkString('if (true) {\n}else { x++; }');
        var error = errors.getErrorList()[0];

        expect(errors)
            .to.have.one.error.from('ruleName');
        assert(errors.explainError(error).indexOf('Missing space before "else" keyword') === 0);
    });

    it('should not report space before keyword', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });

        assert(checker.checkString(
            'if (x) {\n' +
                'x++;\n' +
            '} else {\n' +
                'x--;\n' +
            '}'
        ).isEmpty());
    });

    it('should not report space before non-coddled keywords', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['while'] });

        assert(checker.checkString(
            'while (x < 5) {\n' +
                'x++;\n' +
            '}'
        ).isEmpty());
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
        expect(errors)
            .to.have.one.error.from('ruleName');
        assert(errors.explainError(error).indexOf('Missing space before "else" keyword') === 0);

        errors = checker.checkString('/**/if (true) {\n}else { x++; }');
        error = errors.getErrorList()[0];
        expect(errors)
            .to.have.one.error.from('ruleName');
        assert(errors.explainError(error).indexOf('Missing space before "else" keyword') === 0);

        errors = checker.checkString('do {\nx++;\n}while (x < 5)');
        error = errors.getErrorList()[0];
        expect(errors)
            .to.have.one.error.from('ruleName');
        assert(errors.explainError(error).indexOf('Missing space before "while" keyword') === 0);

        errors = checker.checkString('try {\nx++;\n}catch (e) {}');
        error = errors.getErrorList()[0];
        expect(errors)
            .to.have.one.error.from('ruleName');
        assert(errors.explainError(error).indexOf('Missing space before "catch" keyword') === 0);
    });
});
