var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/validate-order-in-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('should alias option value true to asc', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'asc' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\n_:2,\na:1,\nb:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:1,\nb:3,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:2,\nb:3,\nb_:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nC:3,\nb_:1,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n$:1,\nA:3,\n_:2,\na:4\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n1:1,\n\'11\':2,\n2:4,\nA:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n\'#\':1,\n\'Z\':2,\nÀ:3,\nè:4\n}')).to.have.no.errors();
        });
    });

    describe('option value asc', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'asc' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\n_:2,\na:1,\nb:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:1,\nb:3,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:2,\nb:3,\nb_:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nC:3,\nb_:1,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n$:1,\nA:3,\n_:2,\na:4\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n1:1,\n\'11\':2,\n2:4,\nA:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n\'#\':1,\n\'Z\':2,\nÀ:3,\nè:4\n}')).to.have.no.errors();
        });
    });

    describe('option value asc-insensitive', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'asc-insensitive' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\nA:3,\n_:2,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\n_:2,\na:1,\nb:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:1,\nb:3,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:2,\nb:3,\nb_:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nb_:1,\nC:3,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n1:1,\n\'11\':2,\n2:4,\nA:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n\'#\':1,\n\'Z\':2,\nÀ:3,\nè:4\n}')).to.have.no.errors();
        });
    });

    describe('option value asc-natural', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'asc-natural' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\nA:3,\n_:2,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\n_:2,\na:1,\nb:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:1,\nb:3,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:2,\nb:3,\nb_:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nC:3,\nb_:1,\nc:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\n\'11\':2,\nA:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\n\'#\':1,\n\'Z\':2,\nÀ:3,\nè:4\n}')).to.have.no.errors();
        });
    });

    describe('option value desc', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'desc' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\nb:3,\na:1,\n_:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nb:3,\na:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nb_:1,\nb:3,\na:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nb_:1,\nC:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:4,\n_:2,\nA:3,\n$:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nA:3,\n2:4,\n\'11\':2,\n1:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nè:4,\nÀ:3,\n\'Z\':2,\n\'#\':1\n}')).to.have.no.errors();
        });
    });

    describe('option value desc-insensitive', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'desc-insensitive' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\nb:3,\na:1,\n_:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nb:3,\na:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nb_:1,\nb:3,\na:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nC:3,\nb_:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:4,\nA:3,\n_:2,\n$:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nA:3,\n2:4,\n\'11\':2,\n1:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nè:4,\nÀ:3,\n\'Z\':2,\n\'#\':1\n}')).to.have.no.errors();
        });
    });

    describe('option value desc-natural', function() {
        beforeEach(function() {
            checker.configure({ validateOrderInObjectKeys: 'desc-natural' });
        });

        it('should report unsorted object keys', function() {
            expect(checker.checkString('var obj = {\na:1,\n_:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\na:1,\nc:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\na:2,\nb:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\nb_:1,\nc:2,\nC:3\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n$:1,\n_:2,\nA:3,\na:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n1:1,\n2:4,\nA:3,\n\'11\':2\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
            expect(checker.checkString('var obj = {\n\'#\':1,\nÀ:3,\n\'Z\':2,\nè:4\n}'))
              .to.have.one.validation.error.from('validateOrderInObjectKeys');
        });

        it('should not report sorted object keys', function() {
            expect(checker.checkString('var obj = {\nb:3,\na:1,\n_:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nb:3,\na:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nb_:1,\nb:3,\na:2\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nc:2,\nb_:1,\nC:3\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\na:4,\nA:3,\n_:2,\n$:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nA:3,\n\'11\':2,\n2:4,\n1:1\n}')).to.have.no.errors();
            expect(checker.checkString('var obj = {\nè:4,\nÀ:3,\n\'Z\':2,\n\'#\':1\n}')).to.have.no.errors();
        });
    });
});
