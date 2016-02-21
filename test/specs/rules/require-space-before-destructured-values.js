var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-destructured-values', function() {
    var checker;
    var rules = { requireSpaceBeforeDestructuredValues: true };

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    it('should report with no space after keys colons in plain objects', function() {
        expect(checker.checkString('var { foo:objFoo, bar: objBar } = SomeThing;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');

        expect(checker.checkString('var { foo:objFoo, bar:objBar } = SomeThing;'))
            .to.have.error.count.eq(2);
    });

    it('should report with no space after keys colons in nested arrays', function() {
        expect(checker.checkString('var { a:[{b: objB}] } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');

        expect(checker.checkString('var { a: [{b:objB}] } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');

        expect(checker.checkString('var { a: [ {b: objB}, {c: [ {d:objD}] } ] } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');
    });

    it('should report with no space after keys colons in nested objects', function() {
        expect(checker.checkString('var { a: {b:objB} } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');

        expect(checker.checkString('var { a: {b: objB, c: {d:objD} } } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');

        expect(checker.checkString('var { a:{b: objB, c:{d:objD} } } = obj;'))
            .to.have.error.count.eq(3);
    });

    it('should report with no space after keys colons in nested objects and arrays', function() {
        expect(checker.checkString('var { a: {b:objB}, c: [ {d:objD} ] } = obj;'))
            .to.have.error.count.eq(2);

        expect(checker.checkString('var { a: { b: [ { c: { d: [ {e:objE} ] } } ] } } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');
    });

    it('should report mixed shorthand and normal object destructured values', function() {
        expect(checker.checkString('var { a, b:objB } = obj;'))
            .to.have.one.validation.error.from('requireSpaceBeforeDestructuredValues');
    });

    it('should not report with end of line after keys colons', function() {
        expect(checker.checkString(
            'var {\n' +
            '   a:\n' +
            '   objA\n' +
            '} = obj;'
        )).to.have.no.errors();
    });
});
