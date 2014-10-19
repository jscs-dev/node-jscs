var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/dissalow-space-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal space before keyword', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });

        var errors = checker.checkString('if (true) {\n} else { x++; }');
        var error = errors.getErrorList()[0];

        assert(errors.getErrorCount() === 1);
        assert(errors.explainError(error).indexOf('Illegal space before "else" keyword') === 0);
    });

    it('should not report no space before keyword', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });

        assert(checker.checkString(
            'if (x) {\n' +
                'x++;\n' +
            '}else {\n' +
                'x--;\n' +
            '}'
        ).isEmpty());
    });

    it('should show different error if there is more than one space', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });

        var errors = checker.checkString('if (true) {\n}  else { x++; }');
        var error = errors.getErrorList()[0];

        assert(errors.explainError(error).indexOf('Should be zero spaces instead of 2, before "else" keyword') === 0);
    });

    it('should not trigger error for comments', function() {
        checker.configure({ disallowSpaceBeforeKeywords: ['else'] });
        assert(checker.checkString('if (true) {\n} /**/else { x++; }').isEmpty());
    });

    it('should report on all possible ES3 keywords if a value of true is supplied', function() {
        checker.configure({ disallowSpaceBeforeKeywords: true });

        var errors = checker.checkString('if (true) {\n} else { x++; }');
        var error = errors.getErrorList()[0];
        assert(errors.getErrorCount() === 1);
        assert(errors.explainError(error).indexOf('Illegal space before "else" keyword') === 0);

        errors = checker.checkString('/**/ if (true) {\n} else { x++; }');
        error = errors.getErrorList()[0];
        assert(errors.getErrorCount() === 1);
        assert(errors.explainError(error).indexOf('Illegal space before "else" keyword') === 0);

        errors = checker.checkString('do {\nx++;\n} while (x < 5)');
        error = errors.getErrorList()[0];
        assert(errors.getErrorCount() === 1);
        assert(errors.explainError(error).indexOf('Illegal space before "while" keyword') === 0);

        errors = checker.checkString('try {\nx++;\n} catch (e) {}');
        error = errors.getErrorList()[0];
        assert(errors.getErrorCount() === 1);
        assert(errors.explainError(error).indexOf('Illegal space before "catch" keyword') === 0);
    });
});
