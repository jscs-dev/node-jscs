var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-trailing-whitespace', function() {
    var rules = { disallowTrailingWhitespace: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    reportAndFix({
        name: 'illegal whitespace at the end of line',
        rules: rules,
        errors: 1,
        input: 'var a; \nvar b;',
        output: 'var a;\nvar b;'
    });

    reportAndFix({
        name: 'illegal whitespace at empty line',
        rules: rules,
        errors: 1,
        input: 'var a;\n\t\nvar b;',
        output: 'var a;\n\nvar b;'
    });

    reportAndFix({
        name: 'illegal whitespace at first empty line',
        rules: rules,
        errors: 1,
        input: '\t\nvar a;',
        output: '\nvar a;'
    });

    reportAndFix({
        name: 'illegal whitespace in objects (preserve indentation)',
        rules: rules,
        errors: 3,
        input: 'var t = { \n\ta: {\n\t\tx: 1, \n\t\ty: 1,\n\t}, \n\tb: 2,\n};',
        output: 'var t = {\n\ta: {\n\t\tx: 1,\n\t\ty: 1,\n\t},\n\tb: 2,\n};'
    });

    reportAndFix({
        name: 'illegal whitespace in comment block',
        rules: rules,
        errors: 1,
        input: '/*\n * \n */',
        output: '/*\n *\n */'
    });

    reportAndFix({
        name: 'illegal whitespace in comment line',
        rules: rules,
        errors: 1,
        input: '// line 1 \n// line 2\n',
        output: '// line 1\n// line 2\n'
    });

    reportAndFix({
        name: 'should fix trailing space in block comments',
        rules: rules,
        errors: 1,
        input: '/*\nbla\n\t\n*/',
        output: '/*\nbla\n\n*/'
    });

    reportAndFix({
        name: 'should ignore empty lines in block comments',
        rules: { disallowTrailingWhitespace: 'ignoreEmptyLines' },
        errors: 1,
        input: '/* \nbla\n\t\n*/',
        output: '/*\nbla\n\t\n*/'
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
    });

    describe('ignoreEmptyLines', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: 'ignoreEmptyLines' });
        });

        it('should not report trailing whitespace on empty lines', function() {
            assert(checker.checkString('if(a){\n\tb=c;\n\t\n}').isEmpty());
        });
    });

});
