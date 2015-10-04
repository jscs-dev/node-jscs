var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-keywords-in-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw when given an object', function() {
            expect(function() {
                checker.configure({ disallowKeywordsInComments: {} });
            }).to.throw();
        });

        it('should throw when given an number', function() {
            expect(function() {
                checker.configure({ disallowKeywordsInComments: 2 });
            }).to.throw();
        });
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowKeywordsInComments: true });
        });

        it('should report on an instance of the word todo regardless of case', function() {
            expect(checker.checkString('// todo')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('// TODO')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/** ToDo */')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/**\n * TODO\n */'))
              .to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/* todo */')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/*\n\n\n\n    TODO\n */'))
              .to.have.one.validation.error.from('disallowKeywordsInComments');
        });

        it('should report on an instance of the word fixme regardless of case', function() {
            expect(checker.checkString('//fixme')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('// FIXME')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/** FixMe */')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/**\n * FIXME\n */'))
              .to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/* fixme */')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('/*\n\n\n\n     FIXME\n */'))
              .to.have.one.validation.error.from('disallowKeywordsInComments');
        });

        it('should report multiple errors per line', function() {
            expect(checker.checkString('/* FIXME and ToDO */')).to.have.error.count.equal(2);
            expect(checker.checkString('//Hi. Todo then fixME')).to.have.error.count.equal(2);
        });

        it('should not report on a valid comment without the keywords', function() {
            expect(checker.checkString('//valid')).to.have.no.errors();
            expect(checker.checkString('// valid')).to.have.no.errors();
            expect(checker.checkString('/** valid */')).to.have.no.errors();
            expect(checker.checkString('/*\n\n\n\n     Totally valid\n */')).to.have.no.errors();
        });

        it('should not report on a keywords within words', function() {
            expect(checker.checkString('//ffixme')).to.have.no.errors();
            expect(checker.checkString('// todos')).to.have.no.errors();
            expect(checker.checkString('/** plzfixme*/')).to.have.no.errors();
            expect(checker.checkString('/*\n\n\n\n     todont\n */')).to.have.no.errors();
        });
    });

    describe('option value string', function() {
        beforeEach(function() {
            checker.configure({ disallowKeywordsInComments: 'blah' });
        });

        it('should report on an instance of the word todo regardless of case', function() {
            expect(checker.checkString('// blah')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('// todo')).to.have.no.errors();
        });
    });

    describe('option value array', function() {
        beforeEach(function() {
            checker.configure({ disallowKeywordsInComments: ['blah', 'bloo'] });
        });

        it('should report on an instance of the word todo regardless of case', function() {
            expect(checker.checkString('// blah')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('// bloo')).to.have.one.validation.error.from('disallowKeywordsInComments');
            expect(checker.checkString('// todo')).to.have.no.errors();
        });
    });
});
