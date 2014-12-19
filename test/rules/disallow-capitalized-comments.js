var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-capitalized-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowCapitalizedComments: true });
    });

    it('should report on an uppercase start of a comment', function() {
        assert(checker.checkString('//Invalid').getErrorCount() === 1);
        assert(checker.checkString('// Invalid').getErrorCount() === 1);
        assert(checker.checkString('/** Invalid */').getErrorCount() === 1);
        assert(checker.checkString('/**\n * Invalid\n */').getErrorCount() === 1);
        assert(checker.checkString('/* Invalid */').getErrorCount() === 1);
        assert(checker.checkString('/*\n Invalid\n */').getErrorCount() === 1);
        assert(checker.checkString('//Über').getErrorCount() === 1);
        assert(checker.checkString('//Π').getErrorCount() === 1);
    });

    it('should not report on a lowercase start of a comment', function() {
        assert(checker.checkString('//valid').isEmpty());
        assert(checker.checkString('// valid').isEmpty());
        assert(checker.checkString('/** valid */').isEmpty());
        assert(checker.checkString('//über').isEmpty());
        assert(checker.checkString('//π').isEmpty());
    });

    it('should not report on comments that start with a non-alphabetical character', function() {
        assert(checker.checkString('//123').isEmpty());
        assert(checker.checkString('// 123').isEmpty());
        assert(checker.checkString('/**123*/').isEmpty());
        assert(checker.checkString('/**\n @todo: foobar\n */').isEmpty());
        assert(checker.checkString('/** 123*/').isEmpty());
    });
});
