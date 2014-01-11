var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/camel-case-options', function() {
    var checker = new Checker();

    checker.registerDefaultRules();

    it('should not report any errors', function() {
        checker.configure({
            excludeFiles: ['test/data/exclude-files.js'],
            disallowKeywords: ['with']
        });
        assert(checker.checkFile('test/data/exclude-files.js') === null);
    });
});
