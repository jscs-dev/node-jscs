var Checker = require('../lib/checker');
var assert = require('assert');

describe('modules/errors', function() {
    var checker = new Checker();

    checker.registerDefaultRules();
    checker.configure({ disallowQuotedKeysInObjects: true });

    it('should provide correct indent for tabbed lines', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }');
        var error = errors.getErrorList()[0];

        assert.ok(!/\t/.test(errors.explainError(error)));
    });

    it('should show the correct rule for an error', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }');
        var error = errors.getErrorList()[0];

        assert.ok(error.rule === 'disallowQuotedKeysInObjects');
    });

    it('should suppress errors with disable comment', function() {
        var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable comment followed by another more specific disable comment', function() {
        var errors = checker.checkString('//jscs:disable\n//jscs:disable someOtherRule\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors with disable followed by enable comment', function() {
        var errors = checker.checkString('//jscs:disable\n//jscs:enable\n\tvar x = { "a": 1 }');
        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable comment followed by enable comment after error location', function() {
        var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 };\n//jscs:enable');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors when specific rule is disabled', function() {
        var errors = checker.checkString('//jscs:disable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors when other rule is disabled', function() {
        var errors = checker.checkString('//jscs:disable someRuleName\n\tvar x = { "a": 1 }');
        assert.ok(!errors.isEmpty());
    });

    it('should not suppress errors with disable followed by specific enable comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable followed by specific enable other comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable someRuleName\n\tvar x = { "a": 1 }');

        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors with disable followed by specific enable other comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable someRuleName, disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable using liberal whitespace', function() {
        var errors = checker.checkString('//   jscs:   disable   disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable using block comment', function() {
        var errors = checker.checkString('/*   jscs:   disable   disallowQuotedKeysInObjects */\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable using block comment and weird rule spacing', function() {
        var errors = checker.checkString('/* jscs: disable   someOtherRule, , ' +
            'disallowQuotedKeysInObjects */\nvar x = { "a": 1 }');

        assert.ok(errors.isEmpty());
    });
});
