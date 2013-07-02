var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal space after opening brace', function() {
        checker.configure({ disallowSpacesInsideObjectBrackets: true });
        assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
    });
    it('should report illegal space before closing brace', function() {
        checker.configure({ disallowSpacesInsideObjectBrackets: true });
        assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
    });
    it('should report illegal space in both cases', function() {
        checker.configure({ disallowSpacesInsideObjectBrackets: true });
        assert(checker.checkString('var x = { a: 1 };').getErrorCount() === 2);
    });
    it('should not report with no spaces', function() {
        checker.configure({ disallowSpacesInsideObjectBrackets: true });
        assert(checker.checkString('var x = {a: 1};').isEmpty());
    });
});
