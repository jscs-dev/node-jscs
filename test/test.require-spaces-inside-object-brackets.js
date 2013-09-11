var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space after opening brace', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
    });
    it('should report missing space before closing brace', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
    });
    it('should report missing space in both cases', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
    });
    it('should not report with spaces', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = { a: 1 };').isEmpty());
    });
    it('should not report for empty object', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = {};').isEmpty());
    });
    it('should report for nested object', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        assert(checker.checkString('var x = { a: { b: 1 }};').getErrorCount() === 1);
    });
    it('should report missing space after opening brace', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
    });
    it('should report missing space before closing brace', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
    });
    it('should report missing space in both cases', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
    });
    it('should not report with spaces', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = { a: 1 };').isEmpty());
    });
    it('should not report for nested object', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = { a: { b: 1 }};').isEmpty());
    });
    it('should report illegal space between closing braces for nested object', function() {
        checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        assert(checker.checkString('var x = { a: { b: 1 } };').getErrorCount() === 1);
    });
});
