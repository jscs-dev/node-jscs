var expect = require('chai').expect;
var Checker = require('../../../lib/checker');

describe('rules/disallow-array-destructuring-return', function() {
    var checker;

    describe('when { disallowArrayDestructuringReturn: true }', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({disallowArrayDestructuringReturn: true});
        });

        it('should report on array destructuring with function call', function() {
            expect(
                checker.checkString('const [ a, b ] = func();')
            ).to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should report on array destructuring with self invoking functions', function() {
            expect(
                checker.checkString('const [ a, b ] = (() => [1, 2])();')
            ).to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should report on array destructuring in assignment expressions', function() {
            expect(
                checker.checkString('([ a, b ] = func());')
            ).to.have.one.validation.error.from('disallowArrayDestructuringReturn');
        });

        it('should not report on object destructuring', function() {
            expect(checker.checkString('const { a, b } = func();')).
                to.not.have.errors();
        });

        it('should not report on object destructuring in assignment expression', function() {
            expect(checker.checkString('({ a, b } = func());')).
                to.not.have.errors();
        });
    });
});
