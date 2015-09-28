var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesAfterBlocks: true });
    });

    it('should report padding after block', function() {
        expect(checker.checkString('if(true){}\n\nvar a = 2;'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesAfterBlocks');
    });

    it('should report padding after nested block', function() {
        expect(checker.checkString('if(true){\nif(true) {}\n\nvar a = 2;}'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesAfterBlocks');
    });

    it('should report padding after obj func definition', function() {
        expect(checker.checkString('var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesAfterBlocks');
    });

    it('should report padding after immed func', function() {
        expect(checker.checkString('(function(){\n})()\n\nvar a = 2;'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesAfterBlocks');
    });

    it('should not report end of file', function() {
        expect(checker.checkString('if(true){}')).to.have.no.errors();
    });

    it('should not report end of file with extra line', function() {
        expect(checker.checkString('if(true){}\n')).to.have.no.errors();
    });

    it('should not report missing padding after block', function() {
        expect(checker.checkString('if(true){}\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report missing padding after nested block', function() {
        expect(checker.checkString('if(true){\nif(true) {}\n}')).to.have.no.errors();
    });

    it('should not report missing padding after obj func definition', function() {
        expect(checker.checkString('var a = {\nfoo: function() {\n},\nbar: function() {\n}}')).to.have.no.errors();
    });

    it('should not report missing padding after immed func', function() {
        expect(checker.checkString('(function(){\n})()\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report missing padding in if else', function() {
        expect(checker.checkString('if(true) {\n}\nelse\n{\n}')).to.have.no.errors();
    });

    it('should not report content in missing padding if else', function() {
        expect(checker.checkString('if(true) {\n} else {\n var a = 2; }')).to.have.no.errors();
    });

    it('should not report missing padding in if elseif else', function() {
        expect(checker.checkString('if(true) {\n}\nelse if(true)\n{\n}\nelse {\n}')).to.have.no.errors();
    });

    it('should not report missing padding in do while', function() {
        expect(checker.checkString('do{\n}\nwhile(true)')).to.have.no.errors();
    });

    it('should not report missing padding in try catch', function() {
        expect(checker.checkString('try{\n}\ncatch(e) {}')).to.have.no.errors();
    });

    it('should not report missing padding in try finally', function() {
        expect(checker.checkString('try{\n}\nfinally {}')).to.have.no.errors();
    });

    it('should not report missing padding in try catch finally', function() {
        expect(checker.checkString('try{\n}\ncatch(e) {\n}\nfinally {\n}')).to.have.no.errors();
    });

    it('should not report missing padding in function chain', function() {
        expect(checker.checkString('[].map(function() {})\n.filter(function(){})')).to.have.no.errors();
    });

    reportAndFix({
        name: 'should fix padding after function with semicolon',
        rules: { disallowPaddingNewLinesAfterBlocks: true },
        input: 'var a = function() {};\n\nvar b = 2;',
        output: 'var a = function() {};\nvar b = 2;',
        errors: 1
    });
});
