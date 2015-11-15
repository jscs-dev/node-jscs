var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-array-destructuring', function() {
    var nestedWithDestructuring = [
        'var attributes = {',
        '  colors: ["red", "green", "blue"]',
        '};',
        'var first = attributes.colors[0];'
    ].join('\n');

    var withDestructuring = [
        'var colors = ["red", "green", "blue"];',
        'var [ red ] = colors;'
    ].join('\n');

    var withIndexing = [
        'var colors = ["red", "green", "blue"];',
        'var red = colors[0];'
    ].join('\n');

    describe('when { requireArrayDestructuring: true }', function() {
        it('allows array destructuring', function() {
            var checker = buildChecker({ requireArrayDestructuring: true });

            expect(checker.checkString(withDestructuring)).to.have.no.errors();
        });

        it('disallows variable assignment via array indexing with a literal', function() {
            var checker = buildChecker({ requireArrayDestructuring: true });

            expect(checker.checkString(withIndexing)).
              to.have.one.validation.error.from('requireArrayDestructuring');
        });

        it('requires nested array destructuring', function() {
            var checker = buildChecker({ requireArrayDestructuring: true });

            expect(checker.checkString(nestedWithDestructuring))
              .to.have.one.validation.error.from('requireArrayDestructuring');
        });
    });

    describe('when { requireArrayDestructuring: false }', function() {
        it('allows array destructuring', function() {
            var checker = buildChecker({ requireArrayDestructuring: false });

            expect(checker.checkString(withDestructuring)).to.have.no.errors();
        });

        it('allows variable assignment via array indexing with a literal', function() {
            var checker = buildChecker({ requireArrayDestructuring: false });

            expect(checker.checkString(withDestructuring)).to.have.no.errors();
        });
    });

    function buildChecker(rules) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);

        return checker;
    }
});
