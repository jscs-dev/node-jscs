var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-keywords-in-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowKeywordsInComments: true });
    });

    it('should report on an instance of the word todo regardless of case', function() {
        assert(checker.checkString('// todo').getErrorCount() === 1);
        assert(checker.checkString('// TODO').getErrorCount() === 1);
        assert(checker.checkString('/** ToDo */').getErrorCount() === 1);
        assert(checker.checkString('/**\n * TODO\n */').getErrorCount() === 1);
        assert(checker.checkString('/* todo */').getErrorCount() === 1);
        assert(checker.checkString('/*\n\n\n\n    TODO\n */').getErrorCount() === 1);
    });

    it('should report on an instance of the word fixme regardless of case', function() {
        assert(checker.checkString('//fixme').getErrorCount() === 1);
        assert(checker.checkString('// FIXME').getErrorCount() === 1);
        assert(checker.checkString('/** FixMe */').getErrorCount() === 1);
        assert(checker.checkString('/**\n * FIXME\n */').getErrorCount() === 1);
        assert(checker.checkString('/* fixme */').getErrorCount() === 1);
        assert(checker.checkString('/*\n\n\n\n     FIXME\n */').getErrorCount() === 1);
    });

    it('should report multiple errors per line', function() {
        assert(checker.checkString('/* FIXME and ToDO */').getErrorCount() === 2);
        assert(checker.checkString('//Hi. Todo then fixME').getErrorCount() === 2);
    });

    it('should not report on a valid comment without the keywords', function() {
        assert(checker.checkString('//valid').isEmpty());
        assert(checker.checkString('// valid').isEmpty());
        assert(checker.checkString('/** valid */').isEmpty());
        assert(checker.checkString('/*\n\n\n\n     Totally valid\n */').isEmpty());
    });

    it('should not report on a keywords within words', function() {
        assert(checker.checkString('//ffixme').isEmpty());
        assert(checker.checkString('// todos').isEmpty());
        assert(checker.checkString('/** plzfixme*/').isEmpty());
        assert(checker.checkString('/*\n\n\n\n     todont\n */').isEmpty());
    });
});
