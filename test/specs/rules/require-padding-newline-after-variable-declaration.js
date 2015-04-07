var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newline-after-variable-declaration', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLineAfterVariableDeclaration: true });
    });

    it('should not report if an extra newline is present after var declaration', function() {
        assert(checker.checkString('var a = 1;\n\nconsole.log(a);').isEmpty());
        assert(checker.checkString('function a() { var a = 1;\n\nconsole.log(a); }').isEmpty());
        assert(checker.checkString('var b = 2;\n\nfunction a() { var a = 1;\n\nconsole.log(a); }').isEmpty());
        assert(checker.checkString(
            'var b = 2;\n\nfunction a() { var a = 1;\n\nconsole.log(a); } var c = 3;'
        ).isEmpty());
    });

    it('should not report for consecutive var declarations', function() {
        assert(checker.checkString('var a = 1; var b = 2; var c = 3;').isEmpty());
    });

    it('should not report for consecutive const declarations', function() {
        assert(checker.checkString('const a = 1; const b = 2; const c = 3;').isEmpty());
    });

    it('should not report for consecutive let declarations', function() {
        assert(checker.checkString('let a = 1; let b = 2; let c = 3;').isEmpty());
    });

    it('should not report for consecutive var, const, let declarations', function() {
        assert(checker.checkString('var a = 1; const b = 2; let c = 3;').isEmpty());
    });

    it('should not report if var is the last expression in the block', function() {
        assert(checker.checkString('function a() { var x; }').isEmpty());
    });

    it('should report if no extra newline is present after var declaration', function() {
        assert(checker.checkString('var x; console.log(x);').getErrorCount() === 1);
        assert(checker.checkString('function a() { var x; console.log(x); }').getErrorCount() === 1);
        assert(checker.checkString('var y; function a() { var x; console.log(x); }').getErrorCount() === 2);
    });

    it('should report if no extra newline is present after const declaration', function() {
        assert(checker.checkString('const x = 1; console.log(x);').getErrorCount() === 1);
        assert(checker.checkString('function a() { const x = 2; console.log(x); }').getErrorCount() === 1);
        assert(checker.checkString('const y = 1; function a() { const x = 3; console.log(x); }').getErrorCount() === 2);
    });

    it('should report if no extra newline is present after let declaration', function() {
        assert(checker.checkString('let x; console.log(x);').getErrorCount() === 1);
        assert(checker.checkString('function a() { let x; console.log(x); }').getErrorCount() === 1);
        assert(checker.checkString('let y; function a() { let x; console.log(x); }').getErrorCount() === 2);
    });

    it('should not report when variables are defined in the init part of a for loop', function() {
        assert(checker.checkString('for (var i = 0, length = myArray.length; i < length; i++) {}').isEmpty());
        assert(checker.checkString('for (let i = 0, length = myArray.length; i < length; i++) {}').isEmpty());
    });

    it('should not report when variables are defined in the init part of a for in loop', function() {
        assert(checker.checkString('for (var i in arr) {}').isEmpty());
        assert(checker.checkString('for (let i in arr) {}').isEmpty());
    });

    it('should not report when variables are defined in the init part of a for of loop', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('for (var i of arr) {}').isEmpty());
        assert(checker.checkString('for (let i of arr) {}').isEmpty());
    });

    it('should report if no extra newline is present after var declaration in the body of a for loop', function() {
        assert(checker.checkString(
            'for (var i = 0, length = myArray.length; i < length; i++) {' +
                'var x = 1;' +
                'console.log(x);' +
            '}'
        ).getErrorCount() === 1);
    });

    it('should report if no extra newline is present after let declaration in the body of a for loop', function() {
        assert(checker.checkString(
            'for (let i = 0, length = myArray.length; i < length; i++) {' +
                'let x = 1;' +
                'console.log(x);' +
            '}'
        ).getErrorCount() === 1);
    });

    it('should not trip off on the semicolons (#1244)', function() {
        assert(checker.checkString(
            'var View = Backbone.View.extend({' +
                'initialize: function () {' +
                    'this.listenTo(this.doge, "woof", this.onWoof);' +
                    'this.listenTo(this.doge, "bark", this.onBark);' +
                '}' +
            '});'
        ).isEmpty());
    });
});
