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
});
