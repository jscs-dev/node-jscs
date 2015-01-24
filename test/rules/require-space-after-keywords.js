var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        var errors = checker.checkString('if(x) { x++; }');
        var error = errors.getErrorList()[0];

        assert(errors.explainError(error).indexOf('Missing space after "if" keyword') === 0);
    });

    it('should not report space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').isEmpty());
    });

    it('should not report semicolon after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['return'] });
        assert(checker.checkString('var x = function () { return; }').isEmpty());
    });

    it('should ignore reserved word if it\'s an object key (#83)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['for'] });
        assert(checker.checkString('({for: "bar"})').isEmpty());
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['catch'] });
        assert(checker.checkString('promise.catch()').isEmpty());
    });

    it('should trigger error for the funarg (#277)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['function'] });
        assert(checker.checkString('test.each( stuff, function() {} )').getErrorCount() === 1);
    });

    it('should trigger error for the funarg with two spaces (#277)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['function'] });
        assert(checker.checkString('test.each( function  () {})').getErrorCount() === 1);
    });

    it('should trigger error for keywords inside function (#332)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('function f() { if(true) {"something";} }').getErrorCount() === 1);
    });

    it('should not trigger error for spaced return inside function (#357)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['return'] });
        assert(checker.checkString('function foo() {\r\n\treturn\r\n}').getErrorCount() === 0);
    });

    it('should show different error if there is more than one space (#396)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });

        var errors = checker.checkString('if  (x) {}');
        var error = errors.getErrorList()[0];

        assert(errors.explainError(error).indexOf('Should be one space instead of 2, after "if"') === 0);
    });

    it('should not trigger error for comments (#397)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if /**/ (x) {}').isEmpty());
    });

    it('should trigger different error for comments with more than one space', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });

        var errors = checker.checkString('if  /**/(x) {}');
        var error = errors.getErrorList()[0];

        assert(errors.explainError(error).indexOf('Should be one space instead of 2, after "if"') === 0);
    });

    it('should report on all spaced keywords if a value of true is supplied', function() {
        checker.configure({ requireSpaceAfterKeywords: true });

        assert(!checker.checkString('do{}').isEmpty());
        assert(!checker.checkString('for(){}').isEmpty());
        assert(!checker.checkString('if(x) {}').isEmpty());
        assert(!checker.checkString('if (){}else{}').isEmpty());
        assert(!checker.checkString('switch(){ case 4: break;}').isEmpty());
        assert(!checker.checkString('switch (){ case\'4\': break;}').isEmpty());
        assert(!checker.checkString('try{}').isEmpty());
        assert(!checker.checkString('try {} catch(e){}').isEmpty());
        assert(!checker.checkString('try {} catch (e){} finally{}').isEmpty());
        assert(!checker.checkString('void(0)').isEmpty());
        assert(!checker.checkString('while(x) {}').isEmpty());
        assert(!checker.checkString('with(){}').isEmpty());
        assert(!checker.checkString('var foo = function(){};').isEmpty());
        assert(!checker.checkString('typeof\'4\'').isEmpty());
    });
});
