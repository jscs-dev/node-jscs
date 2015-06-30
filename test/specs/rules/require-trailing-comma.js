var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-trailing-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireTrailingComma: true });
        });

        it('should allow object or array initialization without comma', function() {
            assert(checker.checkString('var x = {}').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = { }').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = []').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = [ ]').getValidationErrorCount() === 0);
        });

        it('should report trailing comma required in object literal', function() {
            assert(checker.checkString('var x = {a: "a", b: "b",}').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a", b: "b",\n}').getValidationErrorCount() === 0);
            expect(checker.checkString('var x = {a: "a", b: "b"}'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = {a: "a", b: "b"\n}'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('function foo() {\nreturn {a: "a"};\n}'))
            .to.have.one.error.from('ruleName');
        });

        it('should report trailing comma required in array', function() {
            assert(checker.checkString('var x = [1, 2,]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = [1, 2,\n]').getValidationErrorCount() === 0);
            expect(checker.checkString('var x = [1, 2]'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = [1, 2\n]'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('function foo() {\nreturn [1, 2];\n}'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report block scopes (#368)', function() {
            assert(checker.checkString('if(true) {\nconsole.log(\'Hello World\');\n}').getValidationErrorCount() === 0);
            assert(checker.checkString('function add(a, b) {\nreturn a + b;\n}').getValidationErrorCount() === 0);
        });

        it('should not report array access (#368)', function() {
            assert(checker.checkString('var foo = [\'Hello World\',\n];\nvar bar = foo[0];').getValidationErrorCount() === 0);
        });

        it('should report right location for no trailing comma in object (#1018)', function() {
            var errs = checker.checkString('var obj = {\n    foo: "foo"\n};').getErrorList();
            assert.equal(errs[0].line + ':' + errs[0].column, '2:14');
        });

        it('should report right location for no trailing comma in array (#1018)', function() {
            var errs = checker.checkString('var arr = [\n    \'foo\'\n];').getErrorList();
            assert.equal(errs[0].line + ':' + errs[0].column, '2:9');
        });
    });

    describe.skip('ignoreSingleValue', function() {
        beforeEach(function() {
            checker.configure({
                requireTrailingComma: {
                    ignoreSingleValue: true
                }
            });
        });

        it('should allow object or array with single property', function() {
            assert(checker.checkString('var x = [1]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a"}').getValidationErrorCount() === 0);
        });

        it('should report trailing comma required for two or more elements in an array', function() {
            expect(checker.checkString('var x = [1, 2]'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = [1, 2, 3]'))
            .to.have.one.error.from('ruleName');
        });

        it('should report trailing comma required for two or more properties in an object', function() {
            expect(checker.checkString('var x = {a: "a", b: "b"}'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = {a: "a", b: "b", c: "c"}'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report empty array or object', function() {
            assert(checker.checkString('var x = []').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {}').getValidationErrorCount() === 0);
        });
    });

    describe.skip('ignoreSingleLine', function() {
        beforeEach(function() {
            checker.configure({
                requireTrailingComma: {
                    ignoreSingleLine: true
                }
            });
        });

        it('should allow object or array on single line with single property', function() {
            assert(checker.checkString('var x = [1,]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = [1]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a",}').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a"}').getValidationErrorCount() === 0);
        });

        it('should allow object or array on single line with multiple properties', function() {
            assert(checker.checkString('var x = [1, 2,]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = [1, 2]').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a", b: "b",}').getValidationErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a", b: "b"}').getValidationErrorCount() === 0);
        });

        it('should report trailing comma required for object or array on multiple lines', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                    ']'
                ).getValidationErrorCount() === 0);
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    ']'
                ).getValidationErrorCount() === 1);
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a: "a",\n' +
                        'b: "b",\n' +
                        'c: "c",\n' +
                    '}'
                ).getValidationErrorCount() === 0);
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a: "a",\n' +
                        'b: "b",\n' +
                        'c: "c"\n' +
                    '}'
                ).getValidationErrorCount() === 1);
        });
    });
});
