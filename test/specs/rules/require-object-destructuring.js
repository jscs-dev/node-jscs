var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-object-destructuring', function() {
    describe('when { requireObjectDestructuring: true }', function() {
        it('disallows direct property access/assignment', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var foo = SomeThing.foo;')).
              to.have.one.validation.error.from('requireObjectDestructuring');
        });

        it('disallows nested property access/assignment', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var bar = SomeThing.foo.bar;')).
              to.have.one.validation.error.from('requireObjectDestructuring');
        });

        it('disallows access/assignment with a string literal', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var val = SomeThing["some.key"].val;')).
              to.have.one.validation.error.from('requireObjectDestructuring');
        });

        it('allows destructuring direct property access/assignment', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var { foo } = SomeThing;')).to.have.no.errors();
        });

        it('allows destructuring nested property access/assignment', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var { bar } = SomeThing.foo;')).to.have.no.errors();
        });

        it('allows destructuring access/assignment with a string literal', function() {
            var checker = buildChecker({ requireObjectDestructuring: true });

            expect(checker.checkString('var { val } = SomeThing["some.key"];')).to.have.no.errors();
        });
    });

    function buildChecker(rules) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);

        return checker;
    }
});
