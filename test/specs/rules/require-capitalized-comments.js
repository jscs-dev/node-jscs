var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-comments', function() {
    var checker;

    function assertEmpty(str) {
        assert(checker.checkString(str).isEmpty());
    }

    function assertOne(str) {
        assert(checker.checkString(str).getErrorCount() === 1);
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
            assertOne('//invalid');
            assertOne('// invalid');
            assertOne('/** invalid */');
            assertOne('/* invalid */');
            assertOne('/**\n * invalid\n*/');
            assertOne('//\n// invalid\n//');
            assertOne('/*\ninvalid\n*/');
            assertOne('//\xFCber');
            assertOne('//\u03C0');
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

        describe('"textblock"', function() {
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
                assertOne(
                    [
                        '// This is a comment',
                        '// that is part of a textblock',
                        'console.log(0)',
                        '// and this is another comment'
                    ].join('\n')
                );

                assertOne([
                        '/*',
                        ' * This is a comment',
                        ' * that is part of a textblock',
                        ' */',
                        '/*',
                        ' * and this is a another comment',
                        ' * that is part of a textblock',
                        ' */'
                    ].join('\n')
                );
            });
        });

    });

    describe('option value allExcept', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: { allExcept: ['istanbul', 'zombiecheckjs'] } });
        });

        it('should report for anything else', function() {
            assertOne('/* my comment: this is cool */');
        });

        it('should report for other comment directives', function() {
            assertOne('/* jshint: -W071 */');
        });

        it('should not report for custom exceptions', function() {
            assertEmpty('/* istanbul ignore next */');

            assertEmpty('/* zombiecheckjs: ensurebrains */');
        });
    });

    describe('ignore non-chars', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: true });
        });

        it('should ignore brackets', function() {
            assertEmpty('// [When the key is not a string, or both a key and value');
            assertEmpty('// ]when the key is not a string, or both a key and value');
        });

        it('should ignore parentheses', function() {
            assertEmpty('// (When the key is not a string, or both a key and value');
            assertEmpty('// )when the key is not a string, or both a key and value');
        });

        it('considers line with first non-letter char as continuation of the comment "(" case',
            function() {
                assertEmpty(
                    '// Expose jQuery and $ identifiers, even in AMD\n' +
                    '// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)\n' +
                    '// and CommonJS for browser emulators (#13566)'
                );
            }
        );

        it('considers line with first non-letter char as continuation of the comment "[" case',
            function() {
                assertEmpty(
                    '// [*]When the key is not a string, or both a key and value\n' +
                    '// are specified, set or extend (existing objects) with either:'
                );
            }
        );

        it('considers line with first non-letter char as continuation of the comment "#" case',
            function() {
                assertEmpty(
                    '// #3456 this does xxx\n' +
                    '// to yyy so that zzz.'
                );
            }
        );

        it('should ignore urls', function() {
            assertEmpty(
                '// http://google.com'
            );
        });

        it('shoulds ignore urls', function() {
            assertEmpty(
                '// http://google.com\n' +
                '// a'
            );
        });
    });
});
