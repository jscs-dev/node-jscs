var expect = require('chai').expect;
var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-object-keys-on-new-line', function() {
    var rules = { disallowObjectKeysOnNewLine: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    reportAndFix({
        name: 'object assignment with missing padding',
        rules: rules,
        input: 'var a = {foo: "bar",\nbar: "baz"}',
        output: 'var a = {foo: "bar", bar: "baz"}'
    });

    reportAndFix({
        name: 'function argument with missing padding',
        rules: rules,
        input: 'foo({foo: "bar",\nbar: "baz"})',
        output: 'foo({foo: "bar", bar: "baz"})'
    });

    it('should not report object without padding', function() {
        expect(checker.checkString('var a = {foo: "bar", bar: "baz"}')).to.have.no.errors();
    });

    it('should not report argument without padding', function() {
        expect(checker.checkString('foo({foo: "bar", bar: "baz"})')).to.have.no.errors();
    });

    it('should not report object with one key', function() {
        expect(checker.checkString('var a = {a: "b"};')).to.have.no.errors();
    });

    it('should report correct error message', function() {
        expect(checker.checkString('foo({foo: "bar",\nbar: "baz"})')).contains
            .one.error('disallowObjectKeysOnNewLine: Object keys should be on the same line');
    });
});
