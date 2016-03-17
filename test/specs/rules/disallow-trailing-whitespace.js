var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
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
        name: 'illegal multiple-whitespace in comment block',
        rules: rules,
        errors: 1,
        input: '/*\n *      \n */',
        output: '/*\n *\n */'
    });

    reportAndFix({
        name: 'illegal multiple-whitespace in comment block when ignoring empty lines',
        rules: { disallowTrailingWhitespace: 'ignoreEmptyLines' },
        errors: 1,
        input: '/*\n *      \n\n */',
        output: '/*\n *\n\n */'
    });

    reportAndFix({
        name: 'illegal whitespace in comment line',
        rules: rules,
        errors: 1,
        input: '// line 1 \n// line 2\n',
        output: '// line 1\n// line 2\n'
    });

    reportAndFix({
        name: 'illegal multiple-whitespace in comment line',
        rules: rules,
        errors: 1,
        input: '// line 1      \n// line 2\n',
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

    reportAndFix({
        name: 'supports windows line breaks',
        rules: rules,
        errors: 2,
        input: ' \r\nvar a; \r\nvar b;\r\n var c;\r\n',
        output: '\r\nvar a;\r\nvar b;\r\n var c;\r\n'
    });

    reportAndFix({
        name: 'supports windows line breaks in a comment',
        rules: rules,
        errors: 1,
        input: '//hey \r\n',
        output: '//hey\r\n'
    });

    reportAndFix({
        name: 'supports mac line breaks',
        rules: rules,
        errors: 2,
        input: ' \rvar a; \rvar b;\r var c;\r',
        output: '\rvar a;\rvar b;\r var c;\r'
    });

    reportAndFix({
        name: 'fixes spaces on the last line',
        rules: rules,
        errors: 1,
        input: 'var a;\n ',
        output: 'var a;\n'
    });

    reportAndFix({
        name: 'fixes space and comment on the last line',
        rules: rules,
        errors: 1,
        input: 'var a;\n/**/ ',
        output: 'var a;\n/**/'
    });

    reportAndFix({
        name: 'fixes spaces on the last lines',
        rules: rules,
        errors: 3,
        input: 'var a;\n \n \n ',
        output: 'var a;\n\n\n'
    });

    it('should handle an empty file', function() {
        expect(checker.checkString('')).to.have.no.errors();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: true });
        });

        it('should report trailing spaces', function() {
            expect(checker.checkString('var x; ')).to.have.one.validation.error.from('disallowTrailingWhitespace');
        });

        it('should report trailing tabs', function() {
            expect(checker.checkString('var x;\t')).to.have.one.validation.error.from('disallowTrailingWhitespace');
        });

        it('should report trailing whitespace on empty lines', function() {
            expect(checker.checkString('if(a){\n\tb=c;\n\t\n}'))
              .to.have.one.validation.error.from('disallowTrailingWhitespace');
        });

        it('should report once for each line', function() {
            expect(checker.checkString('var x;\t\nvar y;\t')).to.have.error.count.equal(2);
        });

        it('should not report multiline strings with trailing whitespace', function() {
            expect(checker.checkString('var x = \' \\\n \';')).to.have.no.errors();
        });

        it('should not report when there is no trailing whitespace', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });
    });

    describe('ignoreEmptyLines', function() {
        beforeEach(function() {
            checker.configure({ disallowTrailingWhitespace: 'ignoreEmptyLines' });
        });

        it('should not report trailing whitespace on empty lines', function() {
            expect(checker.checkString('if(a){\n\tb=c;\n\t\n}')).to.have.no.errors();
        });
    });

});
