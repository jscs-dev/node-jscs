var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-aligned-multiline-params', function() {
    var checker;
    var option;
    function rules() {
        return { 'requireAlignedMultilineParams': option };
    }

    describe('when we pass invalid config options', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should error when an invalid string is passed as the config option', function() {
            expect(function() {
                checker.configure({ 'requireAlignedMultilineParams': 'invalid' });
            }).to.throw();
        });

        it('should error when an object is passed as the config option', function() {
            expect(function() {
                checker.configure({ 'requireAlignedMultilineParams': {} });
            }).to.throw();
        });
    });

    describe('when we pass true as the config option', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            option = true;
            checker.configure(rules());
        });

        it('should validate a function with no params properly', function() {
            var noParamFunction = 'var noParamFunction = function() { \n' +
                                  '  return;\n' +
                                  '};';

            expect(checker.checkString(noParamFunction)).to.have.no.errors();
        });

        it('should validate a function without body properly', function() {
            var noParamFunction = 'var noBody = function(a) {};';

            expect(checker.checkString(noParamFunction)).to.have.no.errors();
        });

        it('should validate a function with a single line of params properly', function() {
            var singleLineFunction = 'var singleLineFunction = function(a, b, c) { \n' +
                                     '  console.log(a + b + c);\n' +
                                     '};';

            expect(checker.checkString(singleLineFunction)).to.have.no.errors();
        });

        it('should validate a function with aligned params properly', function() {
            var unalignedFunction = 'var alignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '  d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.no.errors();
        });

        it('should validate a function with one unaligned param properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '   d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.one.validation.error.from(
                'requireAlignedMultilineParams');
        });

        it('should bail out with function without a body', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '   d, e) {\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.no.errors();
        });

        it('should validate a function with two unaligned params properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '  d, e) {\n' +
                                    '    console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.error.count.equal(2);
        });
    });

    describe('when we pass a number as the config option', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            option = 2;
            checker.configure(rules());
        });

        it('should validate a function with no params properly', function() {
            var noParamFunction = 'var noParamFunction = function() { \n' +
                                  '  return;\n' +
                                  '};';

            expect(checker.checkString(noParamFunction)).to.have.no.errors();
        });

        it('should validate a function with a single line of params properly', function() {
            var singleLineFunction = 'var singleLineFunction = function(a, b, c) { \n' +
                                     '  console.log(a + b + c);\n' +
                                     '};';

            expect(checker.checkString(singleLineFunction)).to.have.no.errors();
        });

        it('should validate a function with aligned params properly', function() {
            var unalignedFunction = 'var alignedFunction = function(a,\n' +
                                    '    b, c,\n' +
                                    '    d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.no.errors();
        });

        it('should validate a function with one unaligned param properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '    d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.one.validation.error.from(
                'requireAlignedMultilineParams');
        });

        it('should validate a function with two unaligned params properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '  b, c,\n' +
                                    '  d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.error.count.equal(2);
        });
    });

    describe('when we pass "firstParam" as the config option', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            option = 'firstParam';
            checker.configure(rules());
        });

        it('should validate a function with no params properly', function() {
            var noParamFunction = 'var noParamFunction = function() { \n' +
                                  '  return;\n' +
                                  '};';

            expect(checker.checkString(noParamFunction)).to.have.no.errors();
        });

        it('should validate a function with a single line of params properly', function() {
            var singleLineFunction = 'var singleLineFunction = function(a, b, c) { \n' +
                                     '  console.log(a + b + c);\n' +
                                     '};';

            expect(checker.checkString(singleLineFunction)).to.have.no.errors();
        });

        it('should validate a function with aligned params properly', function() {
            var unalignedFunction = 'var alignedFunction = function(a,\n' +
                                    '                               b, c,\n' +
                                    '                               d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.no.errors();
        });

        it('should validate a function with one unaligned param properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '                                 b, c,\n' +
                                    '                             d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.one.validation.error.from(
                'requireAlignedMultilineParams');
        });

        it('should validate a function with two unaligned params properly', function() {
            var unalignedFunction = 'var unalignedFunction = function(a,\n' +
                                    '    b, c,\n' +
                                    '    d, e) {\n' +
                                    '  console.log(a + b + c + d + e);\n' +
                                    '};';

            expect(checker.checkString(unalignedFunction)).to.have.error.count.equal(2);
        });
    });
});
