var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-comments', function() {
    var checker;

    function assertEmpty(str) {
        assert(checker.checkString(str).isEmpty());
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCapitalizedComments: true });
    });

    it('should report on a lowercase start of a comment', function() {
        assert(checker.checkString('//invalid').getErrorCount() === 1);
        assert(checker.checkString('// invalid').getErrorCount() === 1);
        assert(checker.checkString('/** invalid */').getErrorCount() === 1);
        assert(checker.checkString('/* invalid */').getErrorCount() === 1);
        assert(checker.checkString('/**\n * invalid\n*/').getErrorCount() === 1);
        assert(checker.checkString('//\n// invalid\n//').getErrorCount() === 1);
        assert(checker.checkString('/*\ninvalid\n*/').getErrorCount() === 1);
        assert(checker.checkString('//über').getErrorCount() === 1);
        assert(checker.checkString('//π').getErrorCount() === 1);
    });

    it('should not report an uppercase start of a comment', function() {
        assertEmpty('//Valid');
        assertEmpty('// Valid');
        assertEmpty('/** Valid */');
        assertEmpty('//\n// Valid\n//');
        assertEmpty('/*\nValid\n*/');
        assertEmpty('//Über');
        assertEmpty('//∏');
    });

    it('should not report on comments that start with a non-alphabetical character', function() {
        assert(checker.checkString('//123').isEmpty());
        assert(checker.checkString('// 123').isEmpty());
        assert(checker.checkString('/**123*/').isEmpty());
        assert(checker.checkString('/**\n @todo: foobar\n */').isEmpty());
        assert(checker.checkString('/** 123*/').isEmpty());
    });

    it('should not report on multiple uppercase lines in a "textblock"', function() {
        assertEmpty([
            '// This is a textblock.',
            '// That has two uppercase lines'
        ].join('\n'));

        assertEmpty([
            '// A textblock may also have multiple lines.',
            '// Those lines can be uppercase as well to support',
            '// sentense breaks in textblocks'
        ].join('\n'));
    });

    it('should not report on multiple uppercase lines in multiple "textblocks"', function() {
        assertEmpty([
            '// This is a textblock',
            '//',
            '// That has two uppercase lines'
        ].join('\n'));
    });

    it('should not report on multiple lines that start with non-letters', function() {
        assertEmpty([
            '// 123 or any non-alphabetical starting character',
            '// @are also valid anywhere'
        ].join('\n'));
    });

    it('should not report on a lowercase start of a comment in a "textblock"', function() {
        assertEmpty([
            '// This is a comment',
            '// that is part of a textblock'
        ].join('\n'));

        assertEmpty([
            '// This is a comment',
            '// that is part of a textblock',
            '//',
            '// So is this the beginning',
            '// of a textblock that can be',
            '// entered in and out of'
        ].join('\n'));

        assertEmpty([
            '// A textblock is a set of lines',
            '// that starts with a capitalized letter',
            '// and has one or more non-capitalized lines',
            '// afterwards'
        ].join('\n'));

        assert(checker.checkString([
            '// Über',
            '// diese Funktion'
        ].join('\n')).isEmpty());
    });
});
