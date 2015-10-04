var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-camelcase-or-uppercase-identifiers', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value `true`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: true });
        });

        it('should report inner all-lowercase underscores', function() {
            expect(checker.checkString('var x_y = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report inner some-lowercase underscores', function() {
            expect(checker.checkString('var X_y = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report inner all-uppercase underscores', function() {
            expect(checker.checkString('var X_Y = "x";')).to.have.no.errors();
        });

        it('should not report no underscores', function() {
            expect(checker.checkString('var xy = "x";')).to.have.no.errors();
        });

        it('should not report leading underscores', function() {
            expect(checker.checkString('var _x = "x", __y = "y";')).to.have.no.errors();
        });

        it('should report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x", y__ = "y";')).to.have.no.errors();
        });

        it('should not report underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report node globals', function() {
            expect(checker.checkString('var a = __dirname + __filename;')).to.have.no.errors();
        });

        it('should report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });
    });

    describe('option value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: 'ignoreProperties' });
        });

        it('should not report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };')).to.have.no.errors();
        });

        it('should not report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;')).to.have.no.errors();
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report es5 getters', function() {
            expect(checker.checkString('var extend = { get a_b() { } };')).to.have.no.errors();
        });

        it('should not report es5 setters', function() {
            expect(checker.checkString('var extend = { set c_d(v) { } };')).to.have.no.errors();
        });
    });
});
