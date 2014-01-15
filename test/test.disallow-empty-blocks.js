var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-empty-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowEmptyBlocks: true });
    });

    it('should report empty ifs', function() {
        assert(checker.checkString('if(true){}').getErrorCount() === 1);
    });

    it('should report empty ifs with comments', function() {
        assert(checker.checkString('if(true){/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty ifs', function() {
        assert(checker.checkString('if(true){a = "";}').isEmpty());
    });

    it('should report empty elses', function() {
        assert(checker.checkString('if(true){a = "";}else{}').getErrorCount() === 1);
    });

    it('should report empty elses with comments', function() {
        assert(checker.checkString('if(true){a = "";}else{/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty elses', function() {
        assert(checker.checkString('if(true){a = "";}else{a = "";}').isEmpty());
    });

    it('should report empty whiles', function() {
        assert(checker.checkString('while(true){}').getErrorCount() === 1);
    });

    it('should report empty whiles with comments', function() {
        assert(checker.checkString('while(true){/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty whiles', function() {
        assert(checker.checkString('while(true){a = "";}').isEmpty());
    });

    it('should report empty for loops', function() {
        assert(checker.checkString('for(;;){}').getErrorCount() === 1);
    });

    it('should report empty for loops with comments', function() {
        assert(checker.checkString('for(;;){/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty for loops', function() {
        assert(checker.checkString('for(;;){a = "";}').isEmpty());
    });

    it('should report empty forin loops', function() {
        assert(checker.checkString('for(a in b){}').getErrorCount() === 1);
    });

    it('should report empty forin loops with comments', function() {
        assert(checker.checkString('for(a in b){/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty forin loops', function() {
        assert(checker.checkString('for(a in b){a = "";}').isEmpty());
    });

    it('should report empty forin loops', function() {
        assert(checker.checkString('for(a in b){}').getErrorCount() === 1);
    });

    it('should report empty forin loops with comments', function() {
        assert(checker.checkString('for(a in b){/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty forin loops', function() {
        assert(checker.checkString('for(a in b){a = "";}').isEmpty());
    });

    it('should report empty try blocks', function() {
        assert(checker.checkString('try{}catch(e){a = "";}').getErrorCount() === 1);
    });

    it('should report empty try blocks with comments', function() {
        assert(checker.checkString('try{/*comment*/}catch(e){a = "";}').getErrorCount() === 1);
    });

    it('should not report non-empty try blocks', function() {
        assert(checker.checkString('try{a = b;}catch(e){a = "";}').isEmpty());
    });

    it('should not report empty catch blocks', function() {
        assert(checker.checkString('try{a=b;}catch(e){}').isEmpty());
    });

    it('should report empty finally blocks', function() {
        assert(checker.checkString('try{a = b;}catch(e){a = "";}finally{}').getErrorCount() === 1);
    });

    it('should report empty finally blocks with comments', function() {
        assert(checker.checkString('try{a = b;}catch(e){a = "";}finally{/*comment*/}').getErrorCount() === 1);
    });

    it('should not report non-empty finally blocks', function() {
        assert(checker.checkString('try{a = b;}catch(e){a = "";}finally{a = c;}').isEmpty());
    });

    it('should report empty blocks', function() {
        assert(checker.checkString('{} var a = b;').getErrorCount() === 1);
    });

    it('should not report empty objects', function() {
        assert(checker.checkString('var a = {};').isEmpty());
    });

    it('should not report empty block for function declarations', function() {
        assert(checker.checkString('function empty(){};').isEmpty());
    });

    it('should not report empty block for function expressions', function() {
        assert(checker.checkString('var a = function(){};').isEmpty());
    });
});
