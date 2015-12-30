var expect = require('chai').expect;

var Checker = require('../../../lib/checker');

var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

function buildChecker(rules) {
    var checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(rules);

    return checker;
}

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

        it('allows computed keys ', function() {
            var checker = buildChecker({ requireEnhancedObjectLiterals: true });
            var code = 'const COMMENTS = { [SINGLE_COMMENT]: SINGLE_COMMENT }';

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

    describe('autofix', function() {
        reportAndFix({
            name: '({ foo: foo })',
            rules: { requireEnhancedObjectLiterals: true },
            input: '({ foo:foo })',
            output: '({ foo })'
        });

        // Can't fix it yet
        reportAndFix({
            name: '({ foo: function() { } })',
            rules: { requireEnhancedObjectLiterals: true },
            input: '({ foo: function() { var x = 1} })',
            output: '({ foo: function() { var x = 1} })'
        });

    });
});
