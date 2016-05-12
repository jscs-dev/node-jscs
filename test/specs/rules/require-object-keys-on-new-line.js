var expect = require('chai').expect;
var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-object-keys-on-new-line', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with option value true - ', function() {
        var rules = { requireObjectKeysOnNewLine: true };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'object assignment with missing padding',
            rules: rules,
            input: 'var a = {foo: "bar",bar: "baz"}',
            output: 'var a = {foo: "bar",\nbar: "baz"}'
        });

        reportAndFix({
            name: 'function argument with missing padding',
            rules: rules,
            input: 'foo({foo: "bar", bar: "baz"})',
            output: 'foo({foo: "bar",\n bar: "baz"})'
        });

        it('should not report object with padding', function() {
            expect(checker.checkString('var a = {foo: "bar",\nbar: "baz"}')).to.have.no.errors();
        });

        it('should not report argument with padding', function() {
            expect(checker.checkString('foo({foo: "bar",\nbar: "baz"})')).to.have.no.errors();
        });

        it('should not report object with one key', function() {
            expect(checker.checkString('var a = {a: "b"};')).to.have.no.errors();
        });

        it('should not break on object methods', function() {
            expect(checker.checkString('({ a() {},\n b() {} });')).to.have.no.errors();
        });
    });

    describe('option value {"allExcept":["sameLine"]}', function() {
        var rules = { requireObjectKeysOnNewLine: { allExcept: ['sameLine'] } };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'object assignment with some padding',
            rules: rules,
            input: 'var a = {foo: "bar",bar: "baz",\nbaz: "foo"}',
            output: 'var a = {foo: "bar",\nbar: "baz",\nbaz: "foo"}'
        });

        it('should not report object with one key', function() {
            expect(checker.checkString('var a = {a: "b"};')).to.have.no.errors();
        });

        it('should not report object with keys on the same line as the declaration', function() {
            expect(checker.checkString('var a = {a: "b",c: "d",e: "f"};')).to.have.no.errors();
        });

        it('should not report object with keys on the same line', function() {
            expect(checker.checkString('var a = {\na: "b",c: "d",e: "f"\n};')).to.have.no.errors();
        });

        it('should not report object with padding', function() {
            expect(checker.checkString('var a = {\na: "b",\nc: "d",\ne: "f"\n};')).to.have.no.errors();
        });

        it('should report on require object keys on new line', function() {
            expect(checker.checkString('var a = {\na: "b",c: "d",\ne: "f"\n};'))
                .to.have.one.validation.error.from('requireObjectKeysOnNewLine');
            expect(checker.checkString('var a = {a: "b",c: "d",\ne: "f"\n};'))
                .to.have.one.validation.error.from('requireObjectKeysOnNewLine');
        });

        it('should neither throw nor report last methods on the same line', function() {
            expect(checker.checkString('var a = {a: "b", c: "d", method() {}};')).to.have.no.errors();
        });

        it('should not break on object methods', function() {
            expect(checker.checkString('({ a() {},\n b() {} });')).to.have.no.errors();
        });
    });
});
