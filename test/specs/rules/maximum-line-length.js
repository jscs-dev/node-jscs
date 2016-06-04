var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/maximum-line-length', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('number option', function() {
        beforeEach(function() {
            checker.configure({ maximumLineLength: 7 });
        });

        it('should report lines longer than the maximum', function() {
            expect(checker.checkString('var xyz;')).to.have.one.validation.error.from('maximumLineLength');
        });

        it('should not report lines equal to the maximum', function() {
            expect(checker.checkString('var xy;')).to.have.no.errors();
        });

        it('should not report lines shorter than the maximum', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });
    });

    describe('tabSize option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 8,
                    tabSize: 2
                }
            });
        });

        it('should not report lines shorter than the maximum', function() {
            expect(checker.checkString('\t\t\t\t')).to.have.no.errors();
        });

        it('should report lines longer than the maximum', function() {
            expect(checker.checkString('\t\t\t\t1')).to.have.one.validation.error.from('maximumLineLength');
        });

        it('should get correct line and column', function() {
            var error = checker.checkString('\n\n\n123456789').getErrorList()[0];

            expect(error.line).to.equal(4);
            expect(error.column).to.equal(9);
        });

        it('should get correct line and column', function() {
            var error = checker.checkString('\n\n\n123456789').getErrorList()[0];

            expect(error.line).to.equal(4);
            expect(error.column).to.equal(9);
        });
    });

    describe('allExcept["comments"] option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allExcept: ['comments']
                }
            });
        });

        it('should not report comments', function() {
            expect(checker.checkString('// a comment\n/* a multiline\n long comment*/')).to.have.no.errors();
        });

        it('should not report comments but still report long code', function() {
            expect(checker.checkString('// a comment\nvar a = tooLong;'))
              .to.have.one.validation.error.from('maximumLineLength');
        });

        it('should still allow the old setting', function() {
            // we need a clean checker or we'll end up validating the file twice
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowComments: true
                }
            });
            expect(checker.checkString('// a comment\nvar a = tooLong;'))
              .to.have.one.validation.error.from('maximumLineLength');
        });
    });

    describe('allExcept["urlComments"] option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 15,
                    allExcept: ['urlComments']
                }
            });
        });

        it('should report comments', function() {
            expect(checker.checkString('// 16 characters' +
                '\n/* 16 characters\n 16 characters*/')).to.have.error.count.equal(3);
        });

        it('should not report url comments if line is long because of it', function() {
            expect(checker.checkString('// <16 chars https://example.com' +
                '\n/* <16 chars http://example.com\n <16 chars http://example.com*/')).to.have.no.errors();
        });

        it('should report url comments if line is long even without it', function() {
            expect(checker.checkString('// 16 characters https://example.com'))
              .to.have.one.validation.error.from('maximumLineLength');
        });

        it('should not report comments but still report long code', function() {
            expect(checker.checkString('// a comment\nvar a = tooLong;'))
              .to.have.one.validation.error.from('maximumLineLength');
        });

        it('should recognize http', function() {
            expect(checker.checkString('// http://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// http://example.com/is/a/url <16 chars')).to.have.no.errors();
        });

        it('should recognize https', function() {
            expect(checker.checkString('// https://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// https://example.com/is/a/url <16 chars')).to.have.no.errors();
        });

        it('should recognize ftp', function() {
            expect(checker.checkString('// ftp://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// ftp://example.com/is/a/url <16 chars')).to.have.no.errors();
        });

        it('should ignore things that arent quite urls', function() {
            expect(checker.checkString('// www.example.com/is/not/a/url'))
              .to.have.one.validation.error.from('maximumLineLength');
            expect(checker.checkString('// example.com/is/not/a/url'))
              .to.have.one.validation.error.from('maximumLineLength');
        });

        it('should should still support the old setting', function() {
            // we need a clean checker or we'll end up validating the file twice
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                maximumLineLength: {
                    value: 15,
                    allowUrlComments: true
                }
            });
            expect(checker.checkString('// <16 chars https://example.com' +
                '\n/* <16 chars http://example.com\n <16 chars http://example.com*/')).to.have.no.errors();
        });
    });

    describe('allExcept["regex"] option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allExcept: ['regex']
                }
            });
        });

        it('should not report regex literals', function() {
            expect(checker.checkString('var a = /longregex/')).to.have.no.errors();
        });

        it('should not report regex literals but still report long code', function() {
            expect(checker.checkString('var a = /longregex/;\nvar b = tooLong;'))
              .to.have.one.validation.error.from('maximumLineLength');
        });

        it('should not report regexes literals but still report regex constructors', function() {
            expect(checker.checkString('var a = /l/;\nvar b = l;\nvar a = new Regex("/l/");'))
              .to.have.error.count.equal(2);
        });

        it('should not be destructive to original data', function() {
            expect(checker.checkString('var a = /regex/;')._file._lines[0].length).to.be.above(1);
        });

        it('should still should support the old setting', function() {
            // we need a clean checker or we'll end up validating the file twice
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowRegex: true
                }
            });
            expect(checker.checkString('var a = /longregex/;\nvar b = tooLong;'))
              .to.have.one.validation.error.from('maximumLineLength');
        });
    });

    describe('allExcept["functionSignature"] option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 20,
                    allExcept: ['functionSignature']
                }
            });
        });

        it('should not report named functions', function() {
            var code = 'function myCoolFunction(argument) { }';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report class methods', function() {
            var code = 'class MyClass {\n' +
                    '  myMethodName(withArgs) {\n' +
                    '  }\n' +
                    '}';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report functions stored in variables', function() {
            var code = 'var fn1 = function(longer) { return null; };\n' +
                    'let fn2 = function(longer) { return null; };\n' +
                    'const fn3 = function() { return "no_params_or_id"; };\n' +
                    'var fn4 = function myFn4() { return null; };\n' +
                    'let fn5 = function myFn5() { return null; };\n' +
                    'const fn6 = function myFn6(whynot) { return null; };';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report arrow functions', function() {
            var code = '(aVeryVeryLongLongParameter => 42);\n' +
                    '(() => "parameterless arrow function");\n' +
                    '((foo, bar, baz, $rootScope) => "quux");';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report functions within IIFE blocks', function() {
            var code = '(function() {\n' +
                    '   function myCoolFunction(argument) { }\n' +
                    '})();';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should report functions within comments', function() {
            var code = '// function myCoolFunction(argument) { }';
            expect(checker.checkString(code)).to.have.one.validation.error.from('maximumLineLength');
        });

        it('should not break on export default function', function() {
            expect(checker.checkString('export default function() {}')).to.have.no.errors();
        });

        it('should not break on export default function with params', function() {
            expect(checker.checkString('export default function(s) {}')).to.have.no.errors();
        });
    });

    describe('allExcept["require"] option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 15,
                    allExcept: ['require']
                }
            });
        });

        it('should not report require invocation', function() {
            var code = 'var foo = require("foo");' +
                       'var bar = require("bar");';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report single-var require invocation', function() {
            var code = 'var foo = require("foo")\n' +
                       '  , bar = require("bar");';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should not report require line shorter than minimum', function() {
            var code = 'require("a");';
            expect(checker.checkString(code)).to.have.no.errors();
        });

        it('should report require used as a variable', function() {
            var code = 'var require = "foobar"';
            expect(checker.checkString(code)).to.have.one.validation.error.from('maximumLineLength');
        });

        it('should report require if the exception is disabled', function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                maximumLineLength: 15
            });

            var code = 'var foo = require("foo");';
            expect(checker.checkString(code)).to.have.one.validation.error.from('maximumLineLength');
        });
    });
});
