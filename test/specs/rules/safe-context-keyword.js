var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/safe-context-keyword', function() {
    var checker;

    describe('string argument', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ safeContextKeyword: 'that' });
        });

        it('should ignore destructuring assignment', function() {
            expect(checker.checkString('const { smth } = this;')).to.have.no.errors();
        });

        it('should ignore destructuring assignment in multi-variable declarations', function() {
            expect(checker.checkString('const a = 1, { smth } = this;')).to.have.no.errors();
        });

        describe('not assigning this', function() {
            it('should not report variable declarations', function() {
                expect(checker.checkString('var a = b;')).to.have.no.errors();
            });

            it('should not report assignment expressions', function() {
                expect(checker.checkString('a = b;')).to.have.no.errors();
            });
        });

        describe('var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var notthat = this;'))
                  .to.have.one.validation.error.from('safeContextKeyword');
            });

            it('should not report "var foo;"', function() {
                expect(checker.checkString('var foo;')).to.have.no.errors();
            });
        });

        describe('without var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('notthat = this;')).to.have.one.validation.error.from('safeContextKeyword');
            });

            it('should not report propery assignment "foo.bar = this"', function() {
                expect(checker.checkString('foo.bar = this')).to.have.no.errors();
            });
        });

        describe('multiple var decl', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var a = 1, that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var a = 1, notthat = this;'))
                  .to.have.one.validation.error.from('safeContextKeyword');
            });
        });
    });

    describe('array argument', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ safeContextKeyword: ['that', 'self'] });
        });

        describe('var', function() {
            it('should not report "var that = this, self = this"', function() {
                expect(checker.checkString('var that = this, self = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var notthat = this;'))
                  .to.have.one.validation.error.from('safeContextKeyword');
            });

            it('should not report "var foo;"', function() {
                expect(checker.checkString('var foo;')).to.have.no.errors();
            });
        });

        describe('without var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('that = this, self = this;')).to.have.no.errors();
            });

            it('should report "notthat = this, notself = this;"', function() {
                expect(checker.checkString('notthat = this; notself = this;')).to.have.error.count.equal(2);
            });

            it('should not report propery assignment "foo.bar = this; bar.foo = this"', function() {
                expect(checker.checkString('foo.bar = this; bar.foo = this')).to.have.no.errors();
            });
        });

        describe('multiple var decl', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var a = 1, that = this, self = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var a = 1, notthat = this, notself = this;')).to.have.error.count.equal(2);
            });
        });
    });
});
