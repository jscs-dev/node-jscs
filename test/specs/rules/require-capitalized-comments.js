var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-capitalized-comments', function() {
    var checker;

    function assertEmpty(str) {
        expect(checker.checkString(str)).to.have.no.errors();
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: true });
        });

        it('should report on a lowercase start of a comment', function() {
            expect(checker.checkString('//invalid'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('// invalid'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('/** invalid */'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('/* invalid */'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('/**\n * invalid\n*/'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('//\n// invalid\n//'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('/*\ninvalid\n*/'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('//\xFCber'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('//\u03C0'))
                .to.have.one.error.from('ruleName');
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

        it('should not report on comments that disable or enable JSCS rules', function() {
            expect(checker.checkString('//jscs:enable')).to.have.no.errors();
            expect(checker.checkString('// jscs:disable')).to.have.no.errors();
            expect(checker.checkString('/*jscs:enable rule*/')).to.have.no.errors();
            expect(checker.checkString('/* jscs:disable rule*/')).to.have.no.errors();
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
            expect(
                checker.checkString([
                    '// This is a comment',
                    '// that is part of a textblock',
                    'console.log(0)',
                    '// and this is another comment'
                ].join('\n'))
            ).to.have.one.validation.error();

            expect(
                checker.checkString([
                    '/*',
                    ' * This is a comment',
                    ' * that is part of a textblock',
                    ' */',
                    '/*',
                    ' * and this is a another comment',
                    ' * that is part of a textblock',
                    ' */'
                ].join('\n'))
            ).to.have.one.validation.error();
        });

    });

    describe.skip('option value allExcept', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedComments: { allExcept: ['istanbul', 'zombiecheckjs'] } });
        });

        it('should report for anything else', function() {
            expect(checker.checkString('/* my comment: this is cool */'))
            .to.have.one.error.from('ruleName');
        });

        it('should report for other comment directives', function() {
            expect(checker.checkString('/* jshint: -W071 */'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report for custom exceptions', function() {
            assertEmpty('/* istanbul ignore next */');

            assertEmpty('/* zombiecheckjs: ensurebrains */');
        });
    });
});
