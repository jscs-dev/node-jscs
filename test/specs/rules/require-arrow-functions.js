var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireArrowFunctions: true, esnext: true });
    });

    it('should report use of anonymous function expression in VariableDeclaration', function() {
        assert(checker.checkString([
            'var anon = function(n) {',
                'return n + 1;',
            '});'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should report use of named function expression in VariableDeclaration', function() {
        assert(checker.checkString([
            'var a = function named(n) {',
                'return n + 1;',
            '});'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should report use of function expression as callback', function() {
        assert(checker.checkString([
            'a.map(function(n) {',
                'return n + 1;',
            '});'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should not report use of function expression in a ReturnStatement', function() {
        assert(checker.checkString('function a() { return function() {} }').isEmpty());
    });

    it('should not report use of object property function expression #1413', function() {
        assert(checker.checkString([
            'var foo = {};',
            'foo.bar = function() {};'
        ].join('\n')).isEmpty());
        assert(checker.checkString([
            'var foo = {',
              'bar: function() {}',
            '};'
        ].join('\n')).isEmpty());
    });

    it('should not report function expression in a AssignmentExpression', function() {
        assert(checker.checkString('a.b = function() {}').isEmpty());
        assert(checker.checkString('a.b.c = function() {}').isEmpty());
    });

    it('should not report a function declaration', function() {
        assert(checker.checkString('function a(n) { return n + 1; }').isEmpty());
    });

    it('should not report a getter expression', function() {
        assert(checker.checkString('var x = { get y() {} }').isEmpty());
    });

    it('should not report a setter expression', function() {
        assert(checker.checkString('var x = { set y(a) {} }').isEmpty());
    });

    it('should not report a shorthand object method', function() {
        assert(checker.checkString([
            'var foo = {',
              'bar() {}',
            '};'
        ].join('\n')).isEmpty());
    });

    it('should not report a class method', function() {
        assert(checker.checkString([
            'class Foo {',
              'bar() {}',
            '};'
        ].join('\n')).isEmpty());
    });

    it('should not report use of arrow function', function() {
        assert(checker.checkString('a.map(n => n + 1);').isEmpty());
    });

    it('should not report use of multi line arrow function', function() {
        assert(checker.checkString([
            'a.map(n => {',
                'return n + 1;',
            '});'
        ].join('\n')).isEmpty());
    });
});
