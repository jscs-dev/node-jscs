var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-space-after-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if(x) { x++; }'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if (x) { x++; }')).to.have.no.errors();
    });

    it('should not report semicolon after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['return'] });
        expect(checker.checkString('var x = function () { return; }')).to.have.no.errors();
    });

    it('should ignore reserved word if it\'s an object key (#83)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['for'] });
        expect(checker.checkString('({for: "bar"})')).to.have.no.errors();
    });

    it('should ignore method name if it\'s a reserved word (#180)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['catch'] });
        expect(checker.checkString('promise.catch()')).to.have.no.errors();
    });

    it('should trigger error for the funarg (#277)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['function'] });
        expect(checker.checkString('test.each( stuff, function() {} )'))
            .to.have.one.error.from('ruleName');
    });

    it('should trigger error for the funarg with two spaces (#277)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['function'] });
        expect(checker.checkString('test.each( function  () {})'))
            .to.have.one.error.from('ruleName');
    });

    it('should trigger error for keywords inside function (#332)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('function f() { if(true) {"something";} }'))
            .to.have.one.error.from('ruleName');
    });

    it('should not trigger error for spaced return inside function (#357)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['return'] });
        assert(checker.checkString('function foo() {\r\n\treturn\r\n}').getValidationErrorCount() === 0);
    });

    it('should trigger error if there is more than one space (#396)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if  (x) {}'))
            .to.have.one.error.from('ruleName');
    });

    it('should not trigger error for comments (#397)', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if /**/ (x) {}')).to.have.no.errors();
    });

    it('should trigger different error for comments with more than one space', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if  /**/(x) {}'))
            .to.have.one.error.from('ruleName');
    });

    it('should report on all spaced keywords if a value of true is supplied', function() {
        checker.configure({ requireSpaceAfterKeywords: true });

        expect(!checker.checkString('do{}')).to.have.no.errors();
        expect(!checker.checkString('for(){}')).to.have.no.errors();
        expect(!checker.checkString('if(x) {}')).to.have.no.errors();
        expect(!checker.checkString('if (){}else{}')).to.have.no.errors();
        expect(!checker.checkString('switch(){ case 4: break;}')).to.have.no.errors();
        expect(!checker.checkString('switch (){ case\'4\': break;}')).to.have.no.errors();
        expect(!checker.checkString('try{}')).to.have.no.errors();
        expect(!checker.checkString('try {} catch(e){}')).to.have.no.errors();
        expect(!checker.checkString('try {} catch (e){} finally{}')).to.have.no.errors();
        expect(!checker.checkString('void(0)')).to.have.no.errors();
        expect(!checker.checkString('while(x) {}')).to.have.no.errors();
        expect(!checker.checkString('with(){}')).to.have.no.errors();
        expect(!checker.checkString('var foo = function(){};')).to.have.no.errors();
        expect(!checker.checkString('typeof\'4\'')).to.have.no.errors();
    });
});
