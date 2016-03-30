var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-newline-before-single-statements-in-if', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requireNewlineBeforeSingleStatementsInIf: true });
        });

        it('should not report for single `if` branch in a block statment on a newline', function() {
            expect(checker.checkString('if (x) {\n doX();\n}'))
                .to.have.no.errors();
        });

        it('should not report for `if` and `else` branches in a block statment on a newline', function() {
            expect(checker.checkString('if (x) {\n doX();\n} else {\n doY();\n}'))
                .to.have.no.errors();
        });

        it('should not report missing newline for `if`, `else if` and `else` branches in a block statment on newlines',
            function() {
                expect(checker.checkString('if (x) {\n doX(); }\nelse if (y) {\n doY(); }\n else {\n doZ(); }'))
                    .to.have.no.errors();
            });

        it('should report missing newline for single `if` branch in a block statment on same line', function() {
            expect(checker.checkString('if (x) { doX(); }'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `if` branch in a block statment on same line', function() {
            expect(checker.checkString('if (x) { doX(); }\n else\n doY();'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `else` branch in a block statment on same line', function() {
            expect(checker.checkString('if (x) {\ndoX();\n}\nelse { doY(); }'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `else if` branch in a block statment on same line', function() {
            expect(checker.checkString('if (x) {\ndoX();\n}\nelse if (y) { doY(); }\nelse {\n doZ(); }'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing two newlines for `if` and `else` branches on same line', function() {
            expect(checker.checkString('if (x) { doX(); }\n else { doY(); }'))
                .to.have.error.count.equal(2);
        });

        it('should report missing three newlines for `if` ,`else if` & `else` branches on same line',
            function() {
                expect(checker.checkString('if (x) { doX(); }\nelse if (y) { doY(); }\n else { doZ(); }'))
                    .to.have.error.count.equal(3);
            });

        it('should not report missing newline for single `if` branch', function() {
            expect(checker.checkString('if (x)\ntrue')).to.have.no.errors();
        });

        it('should not report missing newline for `if` and `else` branches on newlines', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse \ndoY();\n')).to.have.no.errors();
        });

        it('should not report missing newline for `if`, `else if` and `else` branches on newlines', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse if (v)\ndoV();\nelse\ndoY();'))
                .to.have.no.errors();
        });

        it('should report missing newline for single `if` branch', function() {
            expect(checker.checkString('if (x) true'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `if` branch', function() {
            expect(checker.checkString('if (x) doX();\nelse\n doY();'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `else` branch', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse doY();'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline for `else if` branch', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse if (v) doV();\nelse\ndoY();'))
                .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing two newlines for `if` and `else` branches on same line', function() {
            expect(checker.checkString('if (x) doX();\n else doY();'))
                .to.have.error.count.equal(2);
        });

        it('should report missing three newlines for `if` ,`else if` and `else` branches on same line',
            function() {
                expect(checker.checkString('if (x) doX();\nelse if (y) doY();\nelse doZ();'))
                    .to.have.error.count.equal(3);
            });
    });
});
