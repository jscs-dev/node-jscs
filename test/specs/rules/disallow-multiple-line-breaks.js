var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-line-breaks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultipleLineBreaks: true });
    });

    it('should report multiple line break', function() {
        assert(checker.checkString('x = 1;\n\n\ny = 2;').getErrorCount() === 1);
    });

    it('should report multiple line break at EOF', function() {
        assert(checker.checkString('x = 1;\n\n\n').getErrorCount() === 1);
    });

    it('should not report single line break', function() {
        assert(checker.checkString('x = 1;\n\ny = 2').isEmpty());
    });

    it('should not report single line break when first line starts with #!', function() {
        assert(checker.checkString('#!/usr/bin/env node\nx = 1;').isEmpty());
        assert(checker.checkString('#!/usr/bin/env node\n\nx = 1;').isEmpty());
    });

    it('should report error in the correct location when first line starts with #!', function() {
        var error = checker.checkString('#!/usr/bin/env node\n\n\nx = 1;').getErrorList()[0];
        assert.equal(error.line, 1);
        assert.equal(error.column, 19);
    });

    it('should report only once per each sequence of line breaks', function() {
        assert(checker.checkString('x = 1;\n\n\n\n\ny = 2').getErrorCount() === 1);
    });

    it('should report multiple line break if CRLF is used', function() {
        assert(checker.checkString('x = 1;\r\n\r\n\r\ny = 2').getErrorCount() === 1);
    });
});
