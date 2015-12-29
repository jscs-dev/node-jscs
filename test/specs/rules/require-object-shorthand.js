var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-object-shorthand.js', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireObjectShorthand: true
        });
    });

    it('should warn on incorrect configuration', function() {
        expect(function() {
            checker.configure({
                requireObjectShorthand: 1
            });
        }).to.throw();
    });

    it('should warn on possible shorthand', function() {
        expect(checker.checkString('({a: a})')).to.have.one.validation.error.from('requireObjectShorthand');
    });

    it('should warn on one possible shorthand for two props', function() {
        expect(checker.checkString('({a: a, b: c})')).to.have.one.validation.error.from('requireObjectShorthand');
    });

    it('should not warn', function() {
        expect(checker.checkString('({b: c})')).to.have.no.errors();
    });
});
