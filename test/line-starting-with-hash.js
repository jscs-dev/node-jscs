var Checker = require('../lib/checker');
var assert = require('assert');

describe('line srating with hash', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
    });

    it('should ignore lines starting with #!', function() {
        assert(checker.checkString(
            '#! random stuff\n' +
            '#! 1234\n' +
            'var a = 5;\n'
        ).isEmpty());
    });
    it('should ignore ios instruments style import', function() {
        assert(checker.checkString(
            '#import "abc.js"\n' +
            '#import abc.js\n' +
            'var a = 5;\n'
        ).isEmpty());
    });
    it('should not replace when not beginning of line', function() {
        assert(checker.checkString(
            '#import "abc.js"\n' +
            'var b="#import abc.js";\n' +
            'var a = 5;\n'
        ).isEmpty());
    });

});
