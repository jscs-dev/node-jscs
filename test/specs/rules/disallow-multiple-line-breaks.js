var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-multiple-line-breaks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultipleLineBreaks: true });
    });

    it('should report multiple line break', function() {
        expect(checker.checkString('x = 1;\n\n\ny = 2;'))
          .to.have.one.validation.error.from('disallowMultipleLineBreaks');
    });

    it('should report multiple line break at EOF', function() {
        expect(checker.checkString('x = 1;\n\n\n')).to.have.one.validation.error.from('disallowMultipleLineBreaks');
    });

    it('should not report single line break', function() {
        expect(checker.checkString('x = 1;\n\ny = 2')).to.have.no.errors();
    });

    it('should not report single line break when first line starts with #!', function() {
        expect(checker.checkString('#!/usr/bin/env node\nx = 1;')).to.have.no.errors();
        expect(checker.checkString('#!/usr/bin/env node\n\nx = 1;')).to.have.no.errors();
    });

    it('should report error in the correct location when first line starts with #!', function() {
        var error = checker.checkString('#!/usr/bin/env node\n\n\nx = 1;').getErrorList()[0];
        expect(error.line).to.equal(1);
        expect(error.column).to.equal(19);
    });

    it('should not report first statement ', function() {
        expect(checker.checkString('\n\n\nx = 1;')).to.have.no.errors();
    });

    it('should report only once per each sequence of line breaks', function() {
        expect(checker.checkString('x = 1;\n\n\n\n\ny = 2'))
          .to.have.one.validation.error.from('disallowMultipleLineBreaks');
    });

    it('should report multiple line break if CRLF is used', function() {
        expect(checker.checkString('x = 1;\r\n\r\n\r\ny = 2'))
          .to.have.one.validation.error.from('disallowMultipleLineBreaks');
    });
});
