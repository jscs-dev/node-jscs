var assert = require('assert');

var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-semicolons', function() {
    var checker;
    var config = { disallowSemicolons: true };

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(config);
    });

    it('should not allow semicolons at end of line', function() {
        assert.equal(checker.checkString([
            'var a = 1;',
            'var b = 2;',
            'function c() {}',
            'd();'
        ].join('\n')).getErrorCount(), 3);

        reportAndFix({
            name: 'var a = 1;',
            rules: config,
            errors: 1,
            input: 'var a = 1;',
            output: 'var a = 1'
        });

        reportAndFix({
            name: 'function c() {}',
            rules: config,
            errors: 0,
            input: 'function c() {}',
            output: 'function c() {}'
        });

        reportAndFix({
            name: 'd();',
            rules: config,
            errors: 1,
            input: 'd();',
            output: 'd()'
        });
    });

    it('should allow semicolons inline', function() {
        assert(checker.checkString([
            'for (var i = 0; i < l; i++) {',
            'go()',
            '}'
        ].join('\n')).isEmpty());

        reportAndFix({
            name: 'for (var i = 0; i < l; i++) {}',
            rules: config,
            errors: 0,
            input: 'for (var i = 0; i < l; i++) {}',
            output: 'for (var i = 0; i < l; i++) {}'
        });
    });

    it('should allow semicolons at start of line', function() {
        assert(checker.checkString([
            'var foo = function () {}',
            ';[1, 2].forEach(foo)'
        ].join('\n')).isEmpty());

        reportAndFix({
            name: ';[1, 2].forEach(foo)',
            rules: config,
            errors: 0,
            input: ';[1, 2].forEach(foo)',
            output: ';[1, 2].forEach(foo)'
        });
    });

    reportAndFix({
        name: 'var a = 1;\nvar b = 1;',
        rules: config,
        errors: 2,
        input: 'var a = 1;\nvar b = 1;',
        output: 'var a = 1\nvar b = 1'
    });

    describe('ignore needed semicolons', function() {
        it('`for`', function() {
            assert(
                checker.checkString('for (var j = 0,\nlength = arr.length;\nj < l; j++) {}').isEmpty()
            );
        });

        it('`[`', function() {
            assert(
                checker.checkString('"a"\n[0]').isEmpty()
            );
        });

        it('`(`', function() {
            assert(
                checker.checkString('a;\n(1,2)').isEmpty()
            );
        });
    });

    reportAndFix({
        name: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}',
        rules: config,
        errors: 0,
        input: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}',
        output: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}'
    });
});
