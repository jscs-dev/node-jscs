var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-line-feed-at-file-end', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report no line feed at file end', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        expect(checker.checkString('var x;'))
            .to.have.one.error.from('ruleName');
    });

    it('should report no line feed at file end if end with comment', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        expect(checker.checkString('var x;\n//foo'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report existing line feed at file end', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        expect(checker.checkString('var x;\n')).to.have.no.errors();
    });

    it('should not report existing line feed at file end with preceeding comment', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        expect(checker.checkString('var x;\n//foo\n')).to.have.no.errors();
    });
});
