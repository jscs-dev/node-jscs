var Checker = require('../lib/checker');
var configFile = require('../lib/cli-config');
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

    it('should resolve rules path relative to config location', function() {
        var checker = new Checker();
        checker.configure(configFile.load('./test/data/configs/additionalRules/.jscs.json'));

        assert(checker.checkString('').getErrorCount() === 1);
    });
});
