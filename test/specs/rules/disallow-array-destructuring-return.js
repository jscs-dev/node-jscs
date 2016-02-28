var expect = require('chai').expect;
var Checker = require('../../../lib/checker');

describe('rules/disallow-array-destructuring-return', function() {
    var checker;

    describe('when { disallowArrayDestructuringReturn: true }', function() {
        beforeEach(function () {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({disallowArrayDestructuringReturn: true});
        });

        it('should report on array destructuring', function () {
            expect(checker.checkString('function a() { return [ a, b ]; }')).
                to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should report on mixed arrays', function () {
            expect(checker.checkString('function a() { return [ a, 1, "d", {} ]; }')).
                to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should report on multiline shapes of destructuring', function () {
            expect(checker.checkString(
                'function a() { return [ \n' +
                'a,\n' +
                'b,\n' +
                'c\n' +
                ']; }'
            )).to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should not report on object destructuring', function () {
            expect(checker.checkString('function a() { return { a, b }; }')).
                to.not.have.errors();
        });

        it('should not report on arrays, without destructuring', function () {
            expect(checker.checkString('function a() { return [ 1, "a", {}, [], ...spread]; }')).
                to.not.have.errors();
        });
    });
});
