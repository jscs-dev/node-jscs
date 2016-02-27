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

    it(
        'should report in assignment expressions',
        function() {
            expect(checker.checkString(
                '({a:asdf, b: asdf2} = {a:1, b:2});'
            )).to.have.error.count.eq(1);

            expect(checker.checkString(
                'fn({a:asdf, b:asdf2} = obj);'
            )).to.have.error.count.eq(2);

            expect(checker.checkString(
                '({a:a1, b:b1} = {a:a2, b:b2} = {a:1, b:1});'
            )).to.have.error.count.eq(4);

            expect(checker.checkString(
                '([{a:asdf, b:asdf2}] = [{a:1, b:1}]);'
            )).to.have.error.count.eq(2);

            expect(checker.checkString(
                '([{a:a1, b:b1}, {c:{d:[{e:e1}]}}] = obj);'
            )).to.have.error.count.eq(5);
        }
    );

    it(
        'should report in multiline assignment expressions',
        function() {
            expect(checker.checkString(
                '({\n' +
                'a:asdf, b:asdf2\n' +
                '} = {a:1, b:2});'
            )).to.have.error.count.eq(2);
        }
    );

    it('should not report with Identifiers', function() {
        expect(checker.checkString(
            '(a = {a:asdf, b:asdf2});'
        )).to.have.no.errors();
    });
});
