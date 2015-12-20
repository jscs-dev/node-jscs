var expect = require('chai').expect;

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

    it('should correctly handle latest token', function() {
        expect(checker.checkString(';')).to.have.one.validation.error.from('disallowSemicolons');
    });

    it('should correctly handle latest node without error', function() {
        expect(checker.checkString('test')).to.have.no.errors();
    });

    it('should tow latest nodes without error', function() {
        expect(checker.checkString('test; a')).to.have.no.errors();
    });

    it('should not allow semicolons at end of line', function() {
        expect(checker.checkString([
            'var a = 1;',
            'var b = 2;',
            'function c() {}',
            'd();'
        ].join('\n'))).to.have.error.count.equal(3);
    });

    it('should allow semicolons inline', function() {
        expect(checker.checkString([
            'for (var i = 0; i < l; i++) {',
            'go()',
            '}'
        ].join('\n'))).to.have.no.errors();

        reportAndFix({
            name: 'for (var i = 0; i < l; i++) {}',
            rules: config,
            errors: 0,
            input: 'for (var i = 0; i < l; i++) {}',
            output: 'for (var i = 0; i < l; i++) {}'
        });
    });

    it('should allow semicolons at start of line', function() {
        expect(checker.checkString([
            'var foo = function () {}',
            ';[1, 2].forEach(foo)'
        ].join('\n'))).to.have.no.errors();
    });

    describe('ignore needed semicolons', function() {
        it('`for`', function() {
            expect(checker.checkString('for (var j = 0,\nlength = arr.length;\nj < l; j++) {}')).to.have.no.errors();
        });

        it('`[`', function() {
            expect(checker.checkString('"a"\n[0]')).to.have.no.errors();
        });

        it('`(`', function() {
            expect(checker.checkString('a;\n(1,2)')).to.have.no.errors();
        });
    });

    describe('autofix', function() {
        reportAndFix({
            name: ';[1, 2].forEach(foo)',
            rules: config,
            errors: 0,
            input: ';[1, 2].forEach(foo)',
            output: ';[1, 2].forEach(foo)'
        });

        reportAndFix({
            name: 'var a = 1;\nvar b = 1;',
            rules: config,
            errors: 2,
            input: 'var a = 1;\nvar b = 1;',
            output: 'var a = 1\nvar b = 1'
        });

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

        reportAndFix({
            name: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}',
            rules: config,
            errors: 0,
            input: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}',
            output: 'for (var j = 0,\nlength = arr.length;\nj < l; j++) {}'
        });
    });
});
