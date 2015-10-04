var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-line-feed-at-file-end', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireLineFeedAtFileEnd: true });
    });

    it('should report no line feed at file end', function() {
        expect(checker.checkString('var x;')).to.have.one.validation.error.from('requireLineFeedAtFileEnd');
    });

    it('should report no line feed at file end if end with comment', function() {
        expect(checker.checkString('var x;\n//foo')).to.have.one.validation.error.from('requireLineFeedAtFileEnd');
    });

    it('should not report existing line feed at file end', function() {
        expect(checker.checkString('var x;\n')).to.have.no.errors();
    });

    it('should not report existing line feed at file end with preceeding comment', function() {
        expect(checker.checkString('var x;\n//foo\n')).to.have.no.errors();
    });

    it('should report on an IIFE with no line feed at EOF', function() {
        expect(checker.checkString('(function() {\nconsole.log(\'Hello World\');\n})();'))
          .to.have.one.validation.error.from('requireLineFeedAtFileEnd');
    });
});
