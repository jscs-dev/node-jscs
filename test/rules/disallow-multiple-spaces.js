var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-spaces', function() {

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultipleSpaces: true });
    });

    it('should report illegal amount of spaces for vars', function() {
        assert(checker.checkString('var  a = "something  i", b = "";').getErrorCount() === 1);
    });

    it('should report once for each line', function() {
        assert(checker.checkString('var  x;\nvar  y;').getErrorCount() === 2);
    });

    it('should not report for strings with single quotes', function() {
        var test = 'console.log(\'some  reporter double space\')';
        assert(checker.checkString(test).isEmpty());
    });

    it('should not report for strings with double quotes', function() {
        var test = 'console.log("some reporter double  spaces.");';
        assert(checker.checkString(test).isEmpty());
    });

    it('should not report for strings with double quotes', function() {
        var test = 'console.log("some reporter double  space\'s.");';
        assert(checker.checkString(test).isEmpty());
    });

    it('should not report when there is no duplicate spaces', function() {
        assert(checker.checkString('var x;').isEmpty());
    });

    it('should not report about spaces at the start of lines', function() {
        var test = '  var someVarialbe = "something",\n' +
                '    l = "another";\n' +
                'function x () {return 1+1;};';

        assert(checker.checkString(test).isEmpty());
    });
});
