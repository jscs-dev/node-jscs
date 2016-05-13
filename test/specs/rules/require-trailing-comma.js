var expect = require('chai').expect;

var Checker = require('../../../lib/checker');
var getPosition = require('../../../lib/errors').getPosition;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-trailing-comma', function() {
    var rules = { requireTrailingComma: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    reportAndFix({
        name: 'missing comma in object literal',
        rules: rules,
        errors: 1,
        input: 'var t = {\n\ta: 1,\n\tb: 2\n};',
        output: 'var t = {\n\ta: 1,\n\tb: 2,\n};'
    });

    reportAndFix({
        name: 'missing comma in array literal with comment',
        rules: rules,
        errors: 1,
        input: '[a //a\n];',
        output: '[a, //a\n];'
    });

    reportAndFix({
        name: 'missing comma in object literal with comment',
        rules: rules,
        errors: 1,
        input: '({ a: 1 //a\n });',
        output: '({ a: 1, //a\n });'
    });

    reportAndFix({
        name: 'missing comma in object literal on funcion call',
        rules: rules,
        errors: 1,
        input: '[c.catch(() => {}) // test\n ]',
        output: '[c.catch(() => {}), // test\n ]'
    });

    reportAndFix({
        name: 'missing comma in object literal without newline char',
        rules: rules,
        errors: 1,
        input: 'var t = {\n\ta: 1,\n\tb: 2};',
        output: 'var t = {\n\ta: 1,\n\tb: 2,};'
    });

    reportAndFix({
        name: 'missing comma in object literal with additional space',
        rules: rules,
        errors: 1,
        input: 'var t = {\n\ta: 1,\n\tb: 2 };',
        output: 'var t = {\n\ta: 1,\n\tb: 2, };'
    });

    reportAndFix({
        name: 'missing comma in object pattern',
        rules: rules,
        errors: 1,
        input: 'const { foo, bar } = baz;',
        output: 'const { foo, bar, } = baz;'
    });

    reportAndFix({
        name: 'missing comma in object pattern with comment',
        rules: rules,
        errors: 1,
        input: 'const { foo, bar // test\n } = baz;',
        output: 'const { foo, bar, // test\n } = baz;'
    });

    reportAndFix({
        name: 'missing comma in array pattern',
        rules: rules,
        errors: 1,
        input: 'const [ foo, bar ] = baz;',
        output: 'const [ foo, bar, ] = baz;'
    });

    reportAndFix({
        name: 'missing comma in array pattern with comment',
        rules: rules,
        errors: 1,
        input: 'const [ foo, bar // test\n ] = baz;',
        output: 'const [ foo, bar, // test\n ] = baz;'
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireTrailingComma: true });
        });

        it('should allow object or array initialization without comma', function() {
            expect(checker.checkString('var x = {}')).to.have.no.errors();
            expect(checker.checkString('var x = { }')).to.have.no.errors();
            expect(checker.checkString('var x = []')).to.have.no.errors();
            expect(checker.checkString('var x = [ ]')).to.have.no.errors();
        });

        it('should report trailing comma required in object literal', function() {
            expect(checker.checkString('var x = {a: "a", b: "b",}')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a", b: "b",\n}')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a", b: "b"}'))
              .to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('var x = {a: "a", b: "b"\n}'))
              .to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('function foo() {\nreturn {a: "a"};\n}'))
              .to.have.one.validation.error.from('requireTrailingComma');
        });

        it('should report trailing comma required in array', function() {
            expect(checker.checkString('var x = [1, 2,]')).to.have.no.errors();
            expect(checker.checkString('var x = [1, 2,\n]')).to.have.no.errors();
            expect(checker.checkString('var x = [1, 2]')).to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('var x = [1, 2\n]')).to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('function foo() {\nreturn [1, 2];\n}'))
              .to.have.one.validation.error.from('requireTrailingComma');
        });

        it('should not report block scopes (#368)', function() {
            expect(checker.checkString('if(true) {\nconsole.log(\'Hello World\');\n}')).to.have.no.errors();
            expect(checker.checkString('function add(a, b) {\nreturn a + b;\n}')).to.have.no.errors();
        });

        it('should not report array access (#368)', function() {
            expect(checker.checkString('var foo = [\'Hello World\',\n];\nvar bar = foo[0];')).to.have.no.errors();
        });

        it('should report right location for no trailing comma in object (#1018)', function() {
            var errs = checker.checkString('var obj = {\n    foo: "foo"\n};').getErrorList()[0];
            expect(getPosition(errs).line + ':' + getPosition(errs).column).to.equal('2:12');
        });

        it('should report right location for no trailing comma in array (#1018)', function() {
            var errs = checker.checkString('var arr = [\n    \'foo\'\n];').getErrorList()[0];
            expect(getPosition(errs).line + ':' + getPosition(errs).column).to.equal('2:7');
        });
    });

    describe('ignoreSingleValue', function() {
        beforeEach(function() {
            checker.configure({
                requireTrailingComma: {
                    ignoreSingleValue: true
                }
            });
        });

        it('should allow object or array with single property', function() {
            expect(checker.checkString('var x = [1]')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a"}')).to.have.no.errors();
        });

        it('should report trailing comma required for two or more elements in an array', function() {
            expect(checker.checkString('var x = [1, 2]')).to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('var x = [1, 2, 3]')).to.have.one.validation.error.from('requireTrailingComma');
        });

        it('should report trailing comma required for two or more properties in an object', function() {
            expect(checker.checkString('var x = {a: "a", b: "b"}'))
              .to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString('var x = {a: "a", b: "b", c: "c"}'))
              .to.have.one.validation.error.from('requireTrailingComma');
        });

        it('should not report empty array or object', function() {
            expect(checker.checkString('var x = []')).to.have.no.errors();
            expect(checker.checkString('var x = {}')).to.have.no.errors();
        });
    });

    describe('ignoreSingleLine', function() {
        beforeEach(function() {
            checker.configure({
                requireTrailingComma: {
                    ignoreSingleLine: true
                }
            });
        });

        it('should allow object or array on single line with single property', function() {
            expect(checker.checkString('var x = [1,]')).to.have.no.errors();
            expect(checker.checkString('var x = [1]')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a",}')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a"}')).to.have.no.errors();
        });

        it('should allow object or array on single line with multiple properties', function() {
            expect(checker.checkString('var x = [1, 2,]')).to.have.no.errors();
            expect(checker.checkString('var x = [1, 2]')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a", b: "b",}')).to.have.no.errors();
            expect(checker.checkString('var x = {a: "a", b: "b"}')).to.have.no.errors();
        });

        it('should report trailing comma required for object or array on multiple lines', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                    ']'
                )).to.have.no.errors();
            expect(checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    ']'
                )).to.have.one.validation.error.from('requireTrailingComma');
            expect(checker.checkString(
                    'var x = {\n' +
                        'a: "a",\n' +
                        'b: "b",\n' +
                        'c: "c",\n' +
                    '}'
                )).to.have.no.errors();
            expect(checker.checkString(
                    'var x = {\n' +
                        'a: "a",\n' +
                        'b: "b",\n' +
                        'c: "c"\n' +
                    '}'
                )).to.have.one.validation.error.from('requireTrailingComma');
        });
    });
});
