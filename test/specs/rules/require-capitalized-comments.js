var expect = require('chai').expect;

var reportAndFix = require('../../lib/assertHelpers').reportAndFix;
var Checker = require('../../../lib/checker');

describe('rules/require-capitalized-comments', function() {
    var checker;

    function assertEmpty(str) {
        expect(checker.checkString(str)).to.have.no.errors();
    }

    function assertOne(str) {
        expect(checker.checkString(str)).to.have.one.validation.error.from('requireCapitalizedComments');
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
            expect(checker.checkString('//123')).to.have.no.errors();
            expect(checker.checkString('// 123')).to.have.no.errors();
            expect(checker.checkString('/**123*/')).to.have.no.errors();
            expect(checker.checkString('/**\n @todo: foobar\n */')).to.have.no.errors();
            expect(checker.checkString('/** 123*/')).to.have.no.errors();
            expect(checker.checkString([
                '// \xDCber',
                '// diese Funktion'
            ].join('\n'))).to.have.no.errors();
        });

        it('should not report on comments that disable or enable JSCS, ESLint, JSHint and Istanbul rules', function() {
            expect(checker.checkString('//jscs:enable')).to.have.no.errors();
            expect(checker.checkString('// jscs:disable')).to.have.no.errors();
            expect(checker.checkString('/*jscs:enable rule*/')).to.have.no.errors();
            expect(checker.checkString('/* jscs:disable rule*/')).to.have.no.errors();

            expect(checker.checkString('/* eslint eqeqeq:0, curly: 2*/')).to.have.no.errors();
            expect(checker.checkString('/* eslint-env node, mocha */')).to.have.no.errors();
            expect(checker.checkString('/* global var1, var2*/')).to.have.no.errors();
            expect(checker.checkString('/* eslint-disable */')).to.have.no.errors();
            expect(checker.checkString('/* eslint-enable */')).to.have.no.errors();
            expect(checker.checkString('// eslint-disable-line')).to.have.no.errors();

            expect(checker.checkString('/* jshint strict: true */')).to.have.no.errors();
            expect(checker.checkString('/* globals MY_LIB: false */')).to.have.no.errors();
            expect(checker.checkString('/* exported EXPORTED_LIB */')).to.have.no.errors();

            expect(checker.checkString('/* istanbul ignore next */')).to.have.no.errors();
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
                    '// sentence breaks in textblocks'
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
            checker.configure({ requireCapitalizedComments: { allExcept: ['zombiecheckjs:'] } });
        });

        it('should report for anything else', function() {
            assertOne('/* my comment: this is cool */');
        });

        it('should report for other comment directives', function() {
            assertOne('/* jshint: -W071 */');
        });

        it('should not report for custom exceptions', function() {
            assertEmpty('/* zombiecheckjs: ensurebrains */');
        });
    });

    describe('allExcept: ["zombiecheckjs:"]', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: { allExcept: ['zombiecheckjs:'] } });
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

        it('should not ignore comments if in the middle of a code', function() {
            assertOne('function test( /* option */ ) {}');
        });
    });

    describe('inlined: true', function() {
        beforeEach(function() {
            checker.configure({
                requireCapitalizedComments: {
                    inlined: true
                }
            });
        });

        it('should ignore comment in the middle of code', function() {
            assertEmpty('function test( /* option */ ) {}');
        });

        it('should ignore multiline comment in the middle of code', function() {
            assertEmpty('function test( /* \n option */ ) {}');
        });

        it('should not ignore multiple comments if only in the middle of a code', function() {
            assertOne('/* option */ function test( /* option */ ) {}');
        });

        it('should not ignore multiple comments if only in the middle of a code', function() {
            assertOne('/* option */ function test( /* option */ ) {}');
        });
    });

    describe('incorrect configuration', function() {
        it('empty object', function() {
            expect(function() {
                checker.configure({
                    requireCapitalizedComments: {}
                });
            }).to.throw('AssertionError');
        });

        it('inlined: false', function() {
            expect(function() {
                checker.configure({
                    requireCapitalizedComments: {
                        inlined: false
                    }
                });
            }).to.throw('AssertionError');
        });
    });

    describe('ignore non-chars', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: { allExcept: ['zombiecheckjs:'] } });
        });

        it('should ignore brackets', function() {
            assertEmpty('// [When the key is not a string, or both a key and value');
            assertEmpty('// ]when the key is not a string, or both a key and value');
        });

        it('should not report for one of the built-in directives', function() {
            assertEmpty('/* jshint -W071 */');
        });

        it('should not report for custom exceptions', function() {
            assertEmpty('/* zombiecheckjs: ensurebrains */');
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
            assertEmpty(
                '// http://google.com\n' +
                '// a'
            );
            assertEmpty('/* http://google.com */');
        });
    });

    describe('incorrect configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            expect(function() {
                    checker.configure({ requireCapitalizedComments: {} });
                }).to.throw('AssertionError');
        });
    });

    describe('fix', function() {
        reportAndFix({
            name: 'simple case',
            rules: {
                requireCapitalizedComments: true
            },
            input: '//invalid',
            output: '//Invalid'
        });
    });
});
