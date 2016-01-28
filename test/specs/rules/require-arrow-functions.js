var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-arrow-functions', function() {
    var checker;

    function assertEmpty(str) {
        expect(checker.checkString(str)).to.have.no.errors();
    }

    function assertOne(str) {
        expect(!!checker.checkString(str)).to.equal(true);
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireArrowFunctions: true });
    });

    it('should report use of anonymous function expression in VariableDeclaration', function() {
        assertOne([
            'var anon = function(n) {',
                'return n + 1;',
            '};'
        ].join('\n'));
    });

    it('should report use of named function expression in VariableDeclaration', function() {
        assertOne([
            'var a = function named(n) {',
                'return n + 1;',
            '};'
        ].join('\n'));
    });

    it('should report use of function expression as callback', function() {
        assertOne([
            'a.map(function(n) {',
                'return n + 1;',
            '});'
        ].join('\n'));
    });

    it('should not report use of function expression in a ReturnStatement', function() {
        assertEmpty('function a() { return function() {} }');
    });

    it('should not report use of object property function expression #1413', function() {
        assertEmpty([
            'var foo = {};',
            'foo.bar = function() {};'
        ].join('\n'));
        assertEmpty([
            'var foo = {',
              'bar: function() {}',
            '};'
        ].join('\n'));
    });

    it('should not report function expression in a AssignmentExpression', function() {
        assertEmpty('a.b = function() {}');
        assertEmpty('a.b.c = function() {}');
    });

    it('should not report a function declaration', function() {
        assertEmpty('function a(n) { return n + 1; }');
    });

    it('should not report a getter expression', function() {
        assertEmpty('var x = { get y() {} }');
    });

    it('should not report a setter expression', function() {
        assertEmpty('var x = { set y(a) {} }');
    });

    it('should not report a shorthand object method', function() {
        assertEmpty([
            'var foo = {',
              'bar() {}',
            '};'
        ].join('\n'));
    });

    it('should not report a class method', function() {
        assertEmpty([
            'class Foo {',
              'bar() {}',
            '};'
        ].join('\n'));
    });

    it('should not report use of arrow function', function() {
        assertEmpty('a.map(n => n + 1);');
    });

    it('should not report use of multi line arrow function', function() {
        assertEmpty([
            'a.map(n => {',
                'return n + 1;',
            '});'
        ].join('\n'));
    });
});
