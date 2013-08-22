var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/camel-case-options', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report rules in config which don\'t match any registered rules', function() {
        var error;
        try {
            checker.configure({ disallowMulipleLineBreaks: true, disallowMultipleVarDelc: true });
        } catch (e) {
            error = e;
        }
        assert.equal(
            error.message,
            'Unsupported rules: disallowMulipleLineBreaks, disallowMultipleVarDelc'
        );
    });
    it('should not report rules in config which match registered rules', function() {
        var error;
        try {
            checker.configure({ disallowMultipleLineBreaks: true, disallowMultipleVarDecl: true });
        } catch (e) {
            error = e;
        }
        assert(error === undefined);
    });
    it('should not report "excludeFiles" rule as unregistered', function() {
        var error;
        try {
            checker.configure({ excludeFiles: [] });
        } catch (e) {
            error = e;
        }
        assert(error === undefined);
    });
});
