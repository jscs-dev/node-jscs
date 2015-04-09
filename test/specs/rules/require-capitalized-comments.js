var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-comments', function() {
    var checker;

    function assertEmpty(str) {
        assert(checker.checkString(str).isEmpty());
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
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
            assert(checker.checkString('//\xFCber').getErrorCount() === 1);
            assert(checker.checkString('//\u03C0').getErrorCount() === 1);
        });

        it('should not report an uppercase start of a comment', function() {
            assertEmpty('//Valid');
            assertEmpty('// Valid');
            assertEmpty('/** Valid */');
            assertEmpty('//\n// Valid\n//');
            assertEmpty('/*\nValid\n*/');
            assertEmpty('//\xDCber');
            assertEmpty('//\u03A0');
        });

        it('should not report on comments that start with a non-alphabetical character', function() {
            assert(checker.checkString('//123').isEmpty());
            assert(checker.checkString('// 123').isEmpty());
            assert(checker.checkString('/**123*/').isEmpty());
            assert(checker.checkString('/**\n @todo: foobar\n */').isEmpty());
            assert(checker.checkString('/** 123*/').isEmpty());
            assert(checker.checkString([
                '// \xDCber',
                '// diese Funktion'
            ].join('\n')).isEmpty());
        });

        it('should not report on comments that disable or enable JSCS rules', function() {
            assert(checker.checkString('//jscs:enable').isEmpty());
            assert(checker.checkString('// jscs:disable').isEmpty());
            assert(checker.checkString('/*jscs:enable rule*/').isEmpty());
            assert(checker.checkString('/* jscs:disable rule*/').isEmpty());
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
        });

        it('should handle "textblocks" correctly', function() {
            assert(checker.checkString([
                '// This is a comment',
                '// that is part of a textblock',
                'console.log(0)',
                '// and this is another comment'
            ].join('\n')).getErrorCount() === 1);

            assert(checker.checkString([
                '/*',
                ' * This is a comment',
                ' * that is part of a textblock',
                ' */',
                '/*',
                ' * and this is a another comment',
                ' * that is part of a textblock',
                ' */'
            ].join('\n')).getErrorCount() === 1);
        });

    });

    describe('option value allExcept', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: { allExcept: ['istanbul', 'zombiecheckjs'] } });
        });

        it('should report for anything else', function() {
            assert(checker.checkString('/* my comment: this is cool */').getErrorCount() === 1);
        });

        it('should report for other comment directives', function() {
            assert(checker.checkString('/* jshint: -W071 */').getErrorCount() === 1);
        });

        it('should not report for custom exceptions', function() {
            assertEmpty('/* istanbul ignore next */');

            assertEmpty('/* zombiecheckjs: ensurebrains */');
        });
    });
});
