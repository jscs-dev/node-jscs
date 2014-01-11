var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/additional-rules', function() {
    it('should add additional rules', function() {
        var checker = new Checker();
        checker.configure({
            additionalRules: ['test/data/rules/*.js'],
            testAdditionalRules: true
        });

        assert(checker.checkString('').getErrorCount() === 1);
    });
});
