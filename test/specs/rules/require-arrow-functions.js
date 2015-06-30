var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-arrow-functions', function() {
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
        ].join('\n')).getValidationErrorCount() === 1);
    });

    it('should report use of named function expression in VariableDeclaration', function() {
        assert(checker.checkString([
            'var a = function named(n) {',
                'return n + 1;',
            '});'
        ].join('\n')).getValidationErrorCount() === 1);
    });

    it('should report use of function expression as callback', function() {
        assert(checker.checkString([
            'a.map(function(n) {',
                'return n + 1;',
            '});'
        ].join('\n')).getValidationErrorCount() === 1);
    });

    it('should report use of function expression in a ReturnStatement', function() {
        expect(checker.checkString('function a() { return function() {} }'))
            .to.have.one.error.from('ruleName');
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
        expect(checker.checkString('a.b = function() {}')).to.have.no.errors();
        expect(checker.checkString('a.b.c = function() {}')).to.have.no.errors();
    });

    it('should not report a function declaration', function() {
        expect(checker.checkString('function a(n) { return n + 1; }')).to.have.no.errors();
    });

    it('should not report a getter expression', function() {
        expect(checker.checkString('var x = { get y() {} }')).to.have.no.errors();
    });

    it('should not report a setter expression', function() {
        expect(checker.checkString('var x = { set y(a) {} }')).to.have.no.errors();
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
        expect(checker.checkString('a.map(n => n + 1);')).to.have.no.errors();
    });

    it('should not report use of multi line arrow function', function() {
        assert(checker.checkString([
            'a.map(n => {',
                'return n + 1;',
            '});'
        ].join('\n')).isEmpty());
    });
});
