var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-comments', function() {
    var checker;

    // Remark (indexzero): Test helper which makes multi-line comment testing look cleaner
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
    });

    it('should not report an uppercase start of a comment', function() {
        assertEmpty('//Valid');
        assertEmpty('// Valid');
        assertEmpty('/** Valid */');
        assertEmpty('//\n// Valid\n//');
        assertEmpty('/*\nValid\n*/');
    });

    it('should not report on comments that start with a non-alphabetical character', function() {
        assert(checker.checkString('//123').isEmpty());
        assert(checker.checkString('// 123').isEmpty());
        assert(checker.checkString('/**123*/').isEmpty());
        assert(checker.checkString('/**\n @todo: foobar\n */').isEmpty());
        assert(checker.checkString('/** 123*/').isEmpty());
    });

    it('should report on multiple uppercase lines in a "textblock"', function() {
        assert(checker.checkString([
            '// This is a textblock',
            '// That has two uppercase lines'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should report on multiple uppercase lines in multiple "textblocks"', function() {
        assertEmpty([
            '// This is a textblock',
            '//',
            '// That has two uppercase lines'
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
    });
});
