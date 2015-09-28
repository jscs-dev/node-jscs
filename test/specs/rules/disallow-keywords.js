var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal keyword', function() {
        checker.configure({ disallowKeywords: ['with'] });
        expect(checker.checkString('with (x) { y++; }')).to.have.one.validation.error.from('disallowKeywords');
    });
    it('should not report legal keywords', function() {
        checker.configure({ disallowKeywords: ['with'] });
        expect(checker.checkString('if(x) { x++; }')).to.have.no.errors();
    });
});
