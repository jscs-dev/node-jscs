var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-multiple-spaces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                disallowMultipleSpaces: true
            });
        });

        it('should report multiple spaces', function() {
            expect(checker.checkString('var x  = "oops";')).to.have.one.validation.error.from('disallowMultipleSpaces');
            expect(checker.checkString('function x  () {}'))
              .to.have.one.validation.error.from('disallowMultipleSpaces');
            expect(checker.checkString('function x()  {}')).to.have.one.validation.error.from('disallowMultipleSpaces');
            expect(checker.checkString('1  + 2')).to.have.one.validation.error.from('disallowMultipleSpaces');
            expect(checker.checkString('1 +  2')).to.have.one.validation.error.from('disallowMultipleSpaces');
        });

        it('should report multiple spaces between comments', function() {
            expect(checker.checkString('var X = {  /** @type {String} */ name: "some" };'))
              .to.have.one.validation.error.from('disallowMultipleSpaces');
            expect(checker.checkString('var x = "oops";  // Multiple spaces before comment'))
              .to.have.one.validation.error.from('disallowMultipleSpaces');
        });

        it('should not report single spaces between comments', function() {
            expect(checker.checkString('var X = { /** @type {String} */ name: "some" };')).to.have.no.errors();
            expect(checker.checkString('var x = "oops"; // Multiple spaces before comment')).to.have.no.errors();
        });

        it('should not report single spaces', function() {
            expect(checker.checkString('var x = "oops";')).to.have.no.errors();
            expect(checker.checkString('function x() {}')).to.have.no.errors();
            expect(checker.checkString('function x () {}')).to.have.no.errors();
            expect(checker.checkString('1 + 2')).to.have.no.errors();
        });

        it('should not report no spaces', function() {
            expect(checker.checkString('var x="oops";')).to.have.no.errors();
            expect(checker.checkString('function x(){}')).to.have.no.errors();
            expect(checker.checkString('1+2')).to.have.no.errors();
        });

        it('should not report multiple spaces in strings/regular expressions', function() {
            expect(checker.checkString('"hello  world";')).to.have.no.errors();
            expect(checker.checkString('/hello  world/')).to.have.no.errors();
        });

        it('should not report multiple lines', function() {
            expect(checker.checkString('var x = "oops";\nvar y = "hello";')).to.have.no.errors();
        });

        it('should not report indentation', function() {
            expect(checker.checkString('    var x = "oops";')).to.have.no.errors();
        });
    });

    describe('option value allowEOLComments', function() {
        beforeEach(function() {
            checker.configure({
                disallowMultipleSpaces: {
                    allowEOLComments: true
                }
            });
        });

        it('should report multiple spaces', function() {
            expect(checker.checkString('var x  = "oops";')).to.have.one.validation.error.from('disallowMultipleSpaces');
        });

        it('should report multiple spaces between inline comments', function() {
            expect(checker.checkString('var X = {  /** @type {String} */ name: "some" };'))
              .to.have.one.validation.error.from('disallowMultipleSpaces');
        });

        it('should not report multiple spaces between EOL comments', function() {
            expect(checker.checkString('var x = "oops";  // Multiple spaces before comment')).to.have.no.errors();
        });

        it('should not report single spaces between comments', function() {
            expect(checker.checkString('var X = { /** @type {String} */ name: "some" };')).to.have.no.errors();
            expect(checker.checkString('var x = "oops"; // Multiple spaces before comment')).to.have.no.errors();
        });

        it('should not report single spaces', function() {
            expect(checker.checkString('var x = "oops";')).to.have.no.errors();
        });

        it('should not report no spaces', function() {
            expect(checker.checkString('1+2')).to.have.no.errors();
        });
    });

    describe('option value bad value', function() {
        it('raises an assertion error', function() {
            try {
                checker.configure({
                    disallowMultipleSpaces: 'apple'
                });
            } catch (err) {
                return;
            }
            throw new Error('`checker.configure` should have raised an error for an invalid value');
        });
    });
});
