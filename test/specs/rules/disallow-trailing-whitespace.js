var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-trailing-whitespace', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: true });
        });

        it('should report trailing spaces', function() {
            assert(checker.checkString('var x; ').getErrorCount() === 1);
        });

        it('should report trailing tabs', function() {
            assert(checker.checkString('var x;\t').getErrorCount() === 1);
        });

        it('should report trailing whitespace on empty lines', function() {
            assert(checker.checkString('if(a){\n\tb=c;\n\t\n}').getErrorCount() === 1);
        });

        it('should report once for each line', function() {
            assert(checker.checkString('var x;\t\nvar y;\t').getErrorCount() === 2);
        });

        it('should not report multiline strings with trailing whitespace', function() {
            assert(checker.checkString('var x = \' \\\n \';').isEmpty());
        });

        it('should not report when there is no trailing whitespace', function() {
            assert(checker.checkString('var x;').isEmpty());
        });

        it('should report when there is trailing whitespace in line comment', function() {
            assert(checker.checkString('// x \n').getErrorCount() === 1);
        });

        it('should report when there is trailing whitespace in block comment', function() {
            assert(checker.checkString('/*\n *\n \t\n */').getErrorCount() === 1);
        });

        it('should not report trailing spaces the last line of block comment', function() {
            assert(checker.checkString('/*\n\n */').isEmpty());
        });

        it('should report trailing whitespace on the first empty line', function() {
            assert(checker.checkString('\t\n// eof').getErrorCount() === 1);
        });
    });

    describe('ignoreEmptyLines', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: 'ignoreEmptyLines' });
        });

        it('should not report trailing whitespace on empty lines', function() {
            assert(checker.checkString('if(a){\n\tb=c;\n\t\n}').isEmpty());
        });

        it('should not report trailing whitespace on empty lines in block comments', function() {
            assert(checker.checkString('/*\n *\n \t\n */').isEmpty());
        });

        it('should not report trailing whitespace on the first empty line', function() {
            assert(checker.checkString('\t\n//').isEmpty());
        });
    });

    reportAndFix({
        name: 'should fix trailing space (simple case)',
        rules: { disallowTrailingWhitespace: true },
        input: 'var x; ',
        output: 'var x;'
    });

    reportAndFix({
        name: 'should fix trailing space in line comments',
        rules: { disallowTrailingWhitespace: true },
        input: '// bla \n',
        output: '// bla\n'
    });

    reportAndFix({
        name: 'should fix trailing space in block comments',
        rules: { disallowTrailingWhitespace: true },
        input: '/*\nbla\n\t\n*/',
        output: '/*\nbla\n\n*/'
    });

    reportAndFix({
        name: 'should ignore empty lines',
        rules: { disallowTrailingWhitespace: 'ignoreEmptyLines' },
        input: 'var x; \n\t\n',
        output: 'var x;\n\t\n'
    });

    reportAndFix({
        name: 'should ignore empty lines in block comments',
        rules: { disallowTrailingWhitespace: 'ignoreEmptyLines' },
        input: '/* \nbla\n\t\n*/',
        output: '/*\nbla\n\t\n*/'
    });
});
