var Checker = require('../lib/checker');
var assert = require('assert');

describe.only('line srating with hash', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should ignore lines starting with #!', function() {
        var errors = checker.checkString(
            '#! random stuff\n' +
            '#! 1234\n' +
            'var a = 5;\n'
        ).getErrorList();
        assert(errors.length === 0);
    });

    it('should ignore ios instruments style import', function() {
        var errors = checker.checkString(
            '#import "abc.js"\n' +
            '#import abc.js\n' +
            'var a = 5;\n'
        ).getErrorList();
        assert(errors.length === 0);
    });

    it('should not replace when not beginning of line', function() {
        var errors = checker.checkString(
            '#import "abc.js"\n' +
            'var b="#import abc.js";\n' +
            'var a = 5;\n'
        ).getErrorList();
        assert(errors.length === 0);
    });

});
