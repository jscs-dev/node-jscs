var assert = require('assert');
var Checker = require('../lib/checker');

describe('modules/checker', function() {
    var checker = new Checker();

    beforeEach(function() {
        checker.registerDefaultRules();
        checker.configure({
            disallowKeywords: ['with']
        });
    });

    describe('checkDirectory', function() {
        it('should check sub dirs', function(done) {
            checker.checkDirectory('./test/data/checker').then(function(errors) {
                assert(errors.length === 2);

                done();
            });
        });
    });

    describe('checkPath', function() {
        it('should check sub dirs', function(done) {
            checker.checkPath('./test/data/checker').then(function(errors) {
                assert(errors.length === 2);

                done();
            });
        });
    });
});
