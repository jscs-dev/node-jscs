var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCapitalizedComments: true });
    });

    it('should report on a lowercase start of a comment', function() {
        assert(checker.checkString('//invalid').getErrorCount() === 1);
        assert(checker.checkString('// invalid').getErrorCount() === 1);
        assert(checker.checkString('/** invalid */').getErrorCount() === 1);
        assert(checker.checkString('/* invalid */').getErrorCount() === 1);
        assert(checker.checkString('/**\n * invalid\n*/').getErrorCount() === 1);
    });

    it('should not report an uppercase start of a comment', function() {
        assert(checker.checkString('//Valid').isEmpty());
        assert(checker.checkString('// Valid').isEmpty());
        assert(checker.checkString('/** Valid */').isEmpty());
    });

    it('should not report on comments that start with a non-alphabetical character', function() {
        assert(checker.checkString('//123').isEmpty());
        assert(checker.checkString('// 123').isEmpty());
        assert(checker.checkString('/**123*/').isEmpty());
        assert(checker.checkString('/**\n @todo: foobar\n */').isEmpty());
        assert(checker.checkString('/** 123*/').isEmpty());
    });
});
