var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-var', function() {
    describe('when { disallowVar: true }', function() {
        it('disallows `var` declarations', function() {
            var checker = buildChecker({ disallowVar: true });

            expect(checker.checkString('var foo;')).to.have.one.validation.error.from('disallowVar');
        });

        it('allows `let` declarations', function() {
            var checker = buildChecker({ disallowVar: true });

            expect(checker.checkString('let foo;')).to.have.no.errors();
        });

        it('allows `const` declarations', function() {
            var checker = buildChecker({ disallowVar: true });

            expect(checker.checkString('const foo = 1;')).to.have.no.errors();
        });
    });

    describe('when { disallowVar: false }', function() {
        it('allows `var` declarations', function() {
            var checker = buildChecker({ disallowVar: false });

            expect(checker.checkString('var foo;')).to.have.no.errors();
        });

        it('allows `let` declarations', function() {
            var checker = buildChecker({ disallowVar: false });

            expect(checker.checkString('let foo;')).to.have.no.errors();
        });

        it('allows `const` declarations', function() {
            var checker = buildChecker({ disallowVar: false });

            expect(checker.checkString('const foo = 1;')).to.have.no.errors();
        });
    });

    function buildChecker(rules) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);

        return checker;
    }
});
