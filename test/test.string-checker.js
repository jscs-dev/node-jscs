var Checker = require('../lib/checker');
var assert = require('assert');

describe('string-checker', function() {
    it('should not process the rule if it is equals to null (#203)', function() {
        var checker = new Checker();
        checker.registerDefaultRules();

        try {
            checker.configure({
                preset: 'jquery',
                requireCurlyBraces: null
            });
            assert(true);
        } catch (_) {
            assert(false);
        }
    });
});
