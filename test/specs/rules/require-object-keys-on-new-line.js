var expect = require('chai').expect;
var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-object-keys-on-new-line', function() {
    var rules = { requireObjectKeysOnNewLine: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
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
});
