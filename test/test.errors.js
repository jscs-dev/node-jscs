var Checker = require('../lib/checker');
var assert = require('assert');

describe('lib/errors', function() {
    var checker = new Checker();

    checker.registerDefaultRules();
    checker.configure({ disallowQuotedKeysInObjects: true });

    it('should provide correct indent for tabbed lines', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }'),
            error = errors.getErrorList()[0];

        assert.ok(!/\t/.test(errors.explainError(error)));
    });
});
