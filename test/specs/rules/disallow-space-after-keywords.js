var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-after-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if (x) { x++; }')).to.have.one.validation.error.from('disallowSpaceAfterKeywords');
    });

    it('should not report space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        expect(checker.checkString('if(x) { x++; }')).to.have.no.errors();
    });

    it('should report on all spaced keywords if a value true is supplied', function() {
        checker.configure({ disallowSpaceAfterKeywords: true });

        expect(checker.checkString('do {} while (false)')).to.have.errors();
        expect(checker.checkString('for (;;){}')).to.have.errors();
        expect(checker.checkString('if (x) {}')).to.have.errors();
        expect(checker.checkString('if (true){} else{}')).to.have.errors();
        expect(checker.checkString('switch (false){ case 4: break;}')).to.have.errors();
        expect(checker.checkString('switch(true){ case \'4\': break;}')).to.have.errors();
        expect(checker.checkString('try {} catch(e) {}')).to.have.errors();
        expect(checker.checkString('void (0)')).to.have.errors();
        expect(checker.checkString('while (x) {}')).to.have.errors();
        expect(checker.checkString('with ({}){}')).to.have.errors();
        expect(checker.checkString('function foo(){}')).to.have.errors();
        expect(checker.checkString('typeof \'4\'')).to.have.errors();
    });

    it('should not report on `var` and `in` keywords', function() {
        checker.configure({ disallowSpaceAfterKeywords: true });

        expect(checker.checkString('for(var i in a){}')).to.have.no.errors();
    });

    it('should not report illegal space after else when using else if #1346', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['else'] });
        expect(checker.checkString('if(x){} else if(x){} else{}')).to.have.no.errors();
    });

    it('should not report illegal space when the next token is also a keyword #1346', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['return'] });
        expect(checker.checkString('return void(0);')).to.have.no.errors();
    });
});
