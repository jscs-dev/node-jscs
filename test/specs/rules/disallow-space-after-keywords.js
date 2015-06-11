var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });

    it('should not report space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });

    it('should report on all spaced keywords if a value true is supplied', function() {
        checker.configure({ disallowSpaceAfterKeywords: true });

        assert(!checker.checkString('do {} while (false)').isEmpty());
        assert(!checker.checkString('for (;;){}').isEmpty());
        assert(!checker.checkString('if (x) {}').isEmpty());
        assert(!checker.checkString('if (true){} else{}').isEmpty());
        assert(!checker.checkString('switch (false){ case 4: break;}').isEmpty());
        assert(!checker.checkString('switch(true){ case \'4\': break;}').isEmpty());
        assert(!checker.checkString('try {} catch(e) {}').isEmpty());
        assert(!checker.checkString('void (0)').isEmpty());
        assert(!checker.checkString('while (x) {}').isEmpty());
        assert(!checker.checkString('with ({}){}').isEmpty());
        assert(!checker.checkString('function foo(){}').isEmpty());
        assert(!checker.checkString('typeof \'4\'').isEmpty());
    });

    it('should not report on `var` and `in` keywords', function() {
        checker.configure({ disallowSpaceAfterKeywords: true });

        assert(checker.checkString('for(var i in a){}').isEmpty());
    });

    it('should not report illegal space after else when using else if #1346', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['else'] });
        assert(checker.checkString('if(x){} else if(x){} else{}').isEmpty());
    });

    it('should not report illegal space when the next token is also a keyword #1346', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['return'] });
        assert(checker.checkString('return void(0);').isEmpty());
    });
});
