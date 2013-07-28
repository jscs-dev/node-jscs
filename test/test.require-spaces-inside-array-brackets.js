var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-array-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space after opening brace', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
    });
    it('should report missing space before closing brace', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
    });
    it('should report missing space in both cases', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [1];').getErrorCount() === 2);
    });
    it('should not report with spaces', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [ 1 ];').isEmpty());
    });
    it('should not report for empty array', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [];').isEmpty());
    });
    it('should report for nested array', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        assert(checker.checkString('var x = [[ 1 ]];').getErrorCount() === 2);
    });
    it('should report missing space after opening brace', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
    });
    it('should report missing space before closing brace', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
    });
    it('should report missing space in both cases', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        assert(checker.checkString('var x = [1];').getErrorCount() === 2);
    });
    it('should not report with spaces', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        assert(checker.checkString('var x = [ 1 ];').isEmpty());
    });
    it('should not report for nested array', function() {
        checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        assert(checker.checkString('var x = [[ 1 ], [ 2 ]];').isEmpty());
    });
});
