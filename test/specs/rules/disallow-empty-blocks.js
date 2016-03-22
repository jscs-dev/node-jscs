var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-empty-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowEmptyBlocks: true });
    });

    it('should report empty ifs', function() {
        expect(checker.checkString('if(true){}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty ifs with comments', function() {
        expect(checker.checkString('if(true){/*comment*/}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty ifs', function() {
        expect(checker.checkString('if(true){a = "";}')).to.have.no.errors();
    });

    it('should report empty elses', function() {
        expect(checker.checkString('if(true){a = "";}else{}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty elses with comments', function() {
        expect(checker.checkString('if(true){a = "";}else{/*comment*/}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty elses', function() {
        expect(checker.checkString('if(true){a = "";}else{a = "";}')).to.have.no.errors();
    });

    it('should report empty whiles', function() {
        expect(checker.checkString('while(true){}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty whiles with comments', function() {
        expect(checker.checkString('while(true){/*comment*/}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty whiles', function() {
        expect(checker.checkString('while(true){a = "";}')).to.have.no.errors();
    });

    it('should report empty for loops', function() {
        expect(checker.checkString('for(;;){}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty for loops with comments', function() {
        expect(checker.checkString('for(;;){/*comment*/}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty for loops', function() {
        expect(checker.checkString('for(;;){a = "";}')).to.have.no.errors();
    });

    it('should report empty forin loops', function() {
        expect(checker.checkString('for(a in b){}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty forin loops with comments', function() {
        expect(checker.checkString('for(a in b){/*comment*/}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty forin loops', function() {
        expect(checker.checkString('for(a in b){a = "";}')).to.have.no.errors();
    });

    it('should report empty forin loops', function() {
        expect(checker.checkString('for(a in b){}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty forin loops with comments', function() {
        expect(checker.checkString('for(a in b){/*comment*/}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty forin loops', function() {
        expect(checker.checkString('for(a in b){a = "";}')).to.have.no.errors();
    });

    it('should report empty try blocks', function() {
        expect(checker.checkString('try{}catch(e){a = "";}')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty try blocks with comments', function() {
        expect(checker.checkString('try{/*comment*/}catch(e){a = "";}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty try blocks', function() {
        expect(checker.checkString('try{a = b;}catch(e){a = "";}')).to.have.no.errors();
    });

    it('should not report empty catch blocks', function() {
        expect(checker.checkString('try{a=b;}catch(e){}')).to.have.no.errors();
    });

    it('should report empty finally blocks', function() {
        expect(checker.checkString('try{a = b;}catch(e){a = "";}finally{}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should report empty finally blocks with comments', function() {
        expect(checker.checkString('try{a = b;}catch(e){a = "";}finally{/*comment*/}'))
          .to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report non-empty finally blocks', function() {
        expect(checker.checkString('try{a = b;}catch(e){a = "";}finally{a = c;}')).to.have.no.errors();
    });

    it('should report empty blocks', function() {
        expect(checker.checkString('{} var a = b;')).to.have.one.validation.error.from('disallowEmptyBlocks');
    });

    it('should not report empty objects', function() {
        expect(checker.checkString('var a = {};')).to.have.no.errors();
    });

    it('should not report empty block for function declarations', function() {
        expect(checker.checkString('function empty(){};')).to.have.no.errors();
    });

    it('should not report empty block for function expressions', function() {
        expect(checker.checkString('var a = function(){};')).to.have.no.errors();
    });

    it('should not report empty arrow blocks', function() {
        expect(checker.checkString('() => {}')).to.have.no.errors();
    });

    it('should not report empty arrow blocks with arguments', function() {
        expect(checker.checkString('(a) => {}')).to.have.no.errors();
    });

    it('should not report empty object method', function() {
        expect(checker.checkString('var a = { b() {} }')).to.have.no.errors();
    });

    describe('allExcept: ["comments"]', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({disallowEmptyBlocks: {allExcept: ['comments']}});
        });

        it('should not report empty blocks with comments', function() {
            expect(checker.checkString(
                  'if (true) { /* comment */ }'
                )).to.have.no.errors();
            expect(checker.checkString(
                  'if (true) { \n' +
                  ' // another comment \n' +
                  '}'
                )).to.have.no.errors();
            expect(checker.checkString(
                  'if (true) { \n' +
                  ' // another comment \n' +
                  '} else {}'
                )).to.have.one.validation.error.from('disallowEmptyBlocks');
        });
    });

    describe('incorrect configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            expect(function() {
                    checker.configure({ disallowEmptyBlocks: {} });
                }).to.throw('AssertionError');
        });
    });
});
