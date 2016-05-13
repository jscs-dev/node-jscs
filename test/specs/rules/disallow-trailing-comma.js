var expect = require('chai').expect;

var Checker = require('../../../lib/checker');
var getPosition = require('../../../lib/errors').getPosition;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-trailing-comma', function() {
    var checker;
    var rules = { disallowTrailingComma: true };

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    reportAndFix({
        name: 'comma in object literal',
        rules: rules,
        errors: 1,
        input: '({b: 2,})',
        output: '({b: 2})'
    });

    reportAndFix({
        name: 'comma in object literal with couple properties',
        rules: rules,
        errors: 1,
        input:  '({a: 1, b: 2,})',
        output: '({a: 1, b: 2})'
    });

    reportAndFix({
        name: 'comma in array literal',
        rules: rules,
        errors: 1,
        input: '[1, 2,]',
        output: '[1, 2]'
    });

    reportAndFix({
        name: 'comma in object pattern',
        rules: rules,
        errors: 1,
        input: 'const { foo, bar, } = baz;',
        output: 'const { foo, bar } = baz;'
    });

    reportAndFix({
        name: 'comma in array pattern',
        rules: rules,
        errors: 1,
        input: 'const [ foo, bar, ] = baz;',
        output: 'const [ foo, bar ] = baz;'
    });

    it('should report trailing comma in object literal', function() {
        expect(checker.checkString('var x = {a: "a", b: "b"}')).to.have.no.errors();
        expect(checker.checkString('var x = {a: "a", b: "b"\n}')).to.have.no.errors();
        expect(checker.checkString('var x = {a: "a", b: "b",}'))
          .to.have.one.validation.error.from('disallowTrailingComma');
        expect(checker.checkString('var x = {a: "a", b: "b",\n}'))
          .to.have.one.validation.error.from('disallowTrailingComma');
    });

    it('should report trailing comma in array', function() {
        expect(checker.checkString('var x = [1, 2]')).to.have.no.errors();
        expect(checker.checkString('var x = [1, 2\n]')).to.have.no.errors();
        expect(checker.checkString('var x = [1, 2,]')).to.have.one.validation.error.from('disallowTrailingComma');
        expect(checker.checkString('var x = [1, 2,\n]')).to.have.one.validation.error.from('disallowTrailingComma');
    });

    it('should report right location for trailing comma in object (#1018)', function() {
        var errs = checker.checkString('var obj = {\n    foo: "foo",\n};').getErrorList();
        expect(getPosition(errs[0]).line).to.equal(2);
        expect(getPosition(errs[0]).column).to.equal(14);
    });

    it('should report right location for trailing comma in array (#1018)', function() {
        var errs = checker.checkString('var arr = [\n    \'foo\',\n];').getErrorList();
        expect(getPosition(errs[0]).line).to.equal(2);
        expect(getPosition(errs[0]).column).to.equal(9);
    });

    it('should not throw on literal', function() {
        expect(checker.checkString('({ key: "," })')).to.have.no.errors();
    });
});
