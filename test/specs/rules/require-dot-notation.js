var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-dot-notation', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value `true`', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: true });
        });

        it('should report literal subscription', function() {
            assert.equal(checker.checkString('var x = a[\'b\']').getErrorCount(), 1);
            assert.equal(checker.checkString('var x = a[\'while\']').getErrorCount(), 1);
        });

        it('should not report literal subscription for reserved words', function() {
            assert(checker.checkString('var x = a[null]').isEmpty());
            assert(checker.checkString('var x = a[true]').isEmpty());
            assert(checker.checkString('var x = a[false]').isEmpty());
        });

        it('should not report number subscription', function() {
            assert(checker.checkString('var x = a[1]').isEmpty());
        });

        it('should not report variable subscription', function() {
            assert(checker.checkString('var x = a[c]').isEmpty());
        });

        it('should not report object property subscription', function() {
            assert(checker.checkString('var x = a[b.c]').isEmpty());
        });

        it('should not report dot notation', function() {
            assert(checker.checkString('var x = a.b').isEmpty());
        });

        it('should not report for string that can\'t be identifier', function() {
            assert(checker.checkString('x["a-b"]').isEmpty());
            assert(checker.checkString('x["a.b"]').isEmpty());
            assert(checker.checkString('x["a b"]').isEmpty());
            assert(checker.checkString('x["1a"]').isEmpty());
            assert(checker.checkString('x["*"]').isEmpty());
        });
    });

    describe('true value with es3 enabled', function() {
        beforeEach(function() {
            checker.configure({ es3: true, requireDotNotation: true });
        });

        it('should not report literal subscription for es3 keywords or future reserved words', function() {
            assert(checker.checkString('var x = a[\'while\']').isEmpty());
            assert(checker.checkString('var x = a[\'abstract\']').isEmpty());
        });
    });

    describe('option value {"allExcept":"snake_case"}', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: { allExcept: ['snake_case'] } });
        });

        it('should report literal subscription', function() {
            assert(checker.checkString('var x = a[\'b\']').getErrorCount() === 1);
            assert(checker.checkString('var x = a[\'camelA\']').getErrorCount() === 1);
        });

        it('should not report snake case identifier', function() {
            assert(checker.checkString('var x = a[\'snake_a\']').isEmpty());
        });

        it('should not report snake case identifier with trailing underscores', function() {
            assert(checker.checkString('var x = a[\'_snake_a\']').isEmpty());
            assert(checker.checkString('var x = a[\'__snake_a\']').isEmpty());
            assert(checker.checkString('var x = a[\'snake_a_\']').isEmpty());
            assert(checker.checkString('var x = a[\'snake_a__\']').isEmpty());
        });

        it('should not report camel case identifier delimited with snake', function() {
            assert(checker.checkString('var x = a[\'camelA_camelB\']').isEmpty());
            assert(checker.checkString('var x = a[\'camelA_camelB_camelC\']').isEmpty());
        });

        it('should report camel case identifier with trailing underscores', function() {
            assert(checker.checkString('var x = a[\'_camelA\']').getErrorCount() === 1);
            assert(checker.checkString('var x = a[\'__camelA\']').getErrorCount() === 1);
            assert(checker.checkString('var x = a[\'camelA_\']').getErrorCount() === 1);
            assert(checker.checkString('var x = a[\'camelA__\']').getErrorCount() === 1);
        });
    });

    describe('option value {"allExcept":"keywords"} with esnext option', function() {
        beforeEach(function() {
            checker.configure({ esnext: true, requireDotNotation: { allExcept: ['keywords'] } });
        });

        it('should not report literal subscription for es6 reserved words', function() {
            assert(checker.checkString('var x = a[\'yield\']').isEmpty());
            assert(checker.checkString('var x = a[\'let\']').isEmpty());
        });
    });

    describe('deprecated option value "except_snake_case"', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: 'except_snake_case' });
        });

        it('should report literal subscription', function() {
            assert(checker.checkString('var x = a[\'b\']').getErrorCount() === 1);
            assert(checker.checkString('var x = a[\'camelA\']').getErrorCount() === 1);
        });
    });
});
