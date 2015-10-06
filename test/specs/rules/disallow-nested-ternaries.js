var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-nested-ternaries', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('disallowNestedTernaries: true', function() {

        beforeEach(function() {
            checker.configure({ disallowNestedTernaries: true });
        });

        it('should allow single ternary on a single line', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 0);
        });

        it('should allow single ternary on multiple lines', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1\n : 2;').getErrorCount(), 0);
        });

        it('should not allow multi-line nested ternary', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : 3;'
            ).getErrorCount(), 1);
        });

        it('should not allow multi-line nested ternaries', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? 3\n' +
                '        : 4;'
            ).getErrorCount(), 2);
        });

        it('should not allow many leveled multi-line nested ternaries', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? (d === e)\n' +
                '            ? (e === f)\n' +
                '                ? 3\n' +
                '                : 4\n' +
                '            : 4\n' +
                '        : 4;'
            ).getErrorCount(), 4);
        });

        it('should report errors for nesting single line ternaries in multi-line ternary', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? 4 : 5;'
            ).getErrorCount(), 2);
        });

        it('should report errors for nesting multiple single line ternaries in multi-line ternary', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? (d === e) ? 3 : 4 : 5;'
            ).getErrorCount(), 3);
        });

    });

    describe('disallowNestedTernaries: { maxLevel: 1 }', function() {

        beforeEach(function() {
            checker.configure({ disallowNestedTernaries: { maxLevel: 1 } });
        });

        it('should allow single ternary on a single line', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 0);
        });

        it('should allow single ternary on multiple lines', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1\n : 2;').getErrorCount(), 0);
        });

        it('should allow multi-line nested ternary (single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : 3;'
            ).getErrorCount(), 0);
        });

        it('should allow multi-line nested ternaries (single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? 3\n' +
                '        : 4;'
            ).getErrorCount(), 0);
        });

        it('should not allow many leveled multi-line nested ternaries (after single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? (d === e)\n' +
                '            ? (e === f)\n' +
                '                ? 3\n' +
                '                : 4\n' +
                '            : 4\n' +
                '        : 4;'
            ).getErrorCount(), 2);
        });

        it('should allow nesting single line ternaries in multi-line ternary (single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? 4 : 5;'
            ).getErrorCount(), 0);
        });

        it('should not allow nesting single line ternaries (after single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? (d === e) ? 3 : 4 : 5;'
            ).getErrorCount(), 1);
        });

    });

    describe('disallowNestedTernaries: { maxLevel: 2 }', function() {

        beforeEach(function() {
            checker.configure({ disallowNestedTernaries: { maxLevel: 2 } });
        });

        it('should allow single ternary on a single line', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 0);
        });

        it('should allow single ternary on multiple lines', function() {
            assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1\n : 2;').getErrorCount(), 0);
        });

        it('should allow multi-line nested ternary (single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : 3;'
            ).getErrorCount(), 0);
        });

        it('should allow multi-line nested ternaries (single level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? 3\n' +
                '        : 4;'
            ).getErrorCount(), 0);
        });

        it('should not allow many leveled multi-line nested ternaries (after second level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y)\n' +
                '        ? 1\n' +
                '        : 2\n' +
                '    : (c === d)\n' +
                '        ? (d === e)\n' +
                '            ? (e === f)\n' +
                '                ? 3\n' +
                '                : 4\n' +
                '            : 4\n' +
                '        : 4;'
            ).getErrorCount(), 1);
        });

        it('should allow nesting single line ternaries (second level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? (d === e) ? 3 : 4 : 5;'
            ).getErrorCount(), 0);
        });

        it('should not allow nesting single line ternaries (after second level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? 1 : 2\n' +
                '    : (c === d) ? (d === e) ? (e === f) ? 3 : 4 : 5 : 6;'
            ).getErrorCount(), 1);
        });

        it('should not allow nesting single line ternaries (after second level of nesting)', function() {
            assert.strictEqual(checker.checkString(
                'var foo = (a === b)\n' +
                '    ? (x > y) ? (i === j) ? (j === h) ? 1 : 2 : 3 : 4\n' +
                '    : (c === d) ? (d === e) ? (e === f) ? 5 : 6 : 7 : 8;'
            ).getErrorCount(), 2);
        });

    });

});
