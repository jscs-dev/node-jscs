var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-enhanced-object-literals', function() {
    describe('when { requireEnhancedObjectLiterals: true }', function() {
        it('disallows declaring functions as values', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: true });

            expect(checker.checkString('var obj = { foo: function() { } }')).
              to.have.one.validation.error.from('requireEnhancedObjectLiterals');
        });

        it('disallows declaring values keyed by the variable name', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: true });
            var code = 'var foo;\n' +
                       'var obj = { foo: foo };';

            expect(checker.checkString(code)).
              to.have.one.validation.error.from('requireEnhancedObjectLiterals');
        });

        it('allows declaring functions as values', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: true });

            expect(checker.checkString('var obj = { foo() { } }')).to.have.no.errors();
        });

        it('allows declaring values keyed by the variable name', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: true });
            var code = 'var foo;\n' +
                       'var obj = { foo };';

            expect(checker.checkString(code)).to.have.no.errors();
        });
    });

    describe('when { requireEnhancedObjectLiterals: false }', function() {
        it('allows declaring functions as values', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: false });

            expect(checker.checkString('var obj = { foo: function() { } }')).to.no.errors();
        });

        it('allows declaring values keyed by the variable name', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: false });
            var code = 'var foo;\n' +
                       'var obj = { foo: foo };';

            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('allows declaring functions as values', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: false });

            expect(checker.checkString('var obj = { foo() { } }')).to.have.no.errors();
        });

        it('allows declaring values keyed by the variable name', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: false });
            var code = 'var foo;\n' +
                       'var obj = { foo };';

            expect(checker.checkString(code)).to.have.no.errors();
        });
    });

    function buildChecker(rules) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);

        return checker;
    }
});
