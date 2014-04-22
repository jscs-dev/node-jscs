var Checker = require('../../lib/modules/checker');
var configFile = require('../../lib/modules/cli-config');
var assert = require('assert');

describe('options/additional-rules', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
    });

    it('should add additional rules', function() {
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
