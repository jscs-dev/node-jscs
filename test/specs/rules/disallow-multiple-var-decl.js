var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-var-decl', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('obsolete', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: true });
        });

        it('should report that the name is obsolete', function() {
            assert(checker.checkString('void 0;').getErrorCount() === 1);
        });
    });
});
