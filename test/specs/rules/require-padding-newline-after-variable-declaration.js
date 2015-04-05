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

    it('should not report for consecutive let declarations', function() {
        assert(checker.checkString('let a = 1; let b = 2; let c = 3;').isEmpty());
    });

    it('should not report for consecutive const declarations', function() {
        assert(checker.checkString('const a = 1; const b = 2; const c = 3;').isEmpty());
    });

    it('should not report if var is the last expression in the block', function() {
        assert(checker.checkString('function a() { var x; }').isEmpty());
    });

    it('should report if no extra newline is present after var declaration', function() {
        assert(checker.checkString('var x; console.log(x);').getErrorCount() === 1);
        assert(checker.checkString('function a() { var x; console.log(x); }').getErrorCount() === 1);
        assert(checker.checkString('var y; function a() { var x; console.log(x); }').getErrorCount() === 2);
    });
});
