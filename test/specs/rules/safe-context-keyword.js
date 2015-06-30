var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/safe-context-keyword', function() {
    var checker;

    describe.skip('string argument', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ safeContextKeyword: 'that' });
        });

        describe.skip('not assigning this', function() {
            it('should not report variable declarations', function() {
                expect(checker.checkString('var a = b;')).to.have.no.errors();
            });

            it('should not report assignment expressions', function() {
                expect(checker.checkString('a = b;')).to.have.no.errors();
            });
        });

        describe.skip('var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var notthat = this;'))
            .to.have.one.error.from('ruleName');
            });

            it('should not report "var foo;"', function() {
                assert(checker.checkString('var foo;').getValidationErrorCount() === 0);
            });
        });

        describe.skip('without var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('notthat = this;'))
            .to.have.one.error.from('ruleName');
            });

            it('should not report propery assignment "foo.bar = this"', function() {
                assert(checker.checkString('foo.bar = this').getValidationErrorCount() === 0);
            });
        });

        describe.skip('multiple var decl', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var a = 1, that = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var a = 1, notthat = this;'))
            .to.have.one.error.from('ruleName');
            });
        });
    });

    describe.skip('array argument', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ safeContextKeyword: ['that', 'self'] });
        });

        describe.skip('var', function() {
            it('should not report "var that = this, self = this"', function() {
                expect(checker.checkString('var that = this, self = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                expect(checker.checkString('var notthat = this;'))
            .to.have.one.error.from('ruleName');
            });

            it('should not report "var foo;"', function() {
                assert(checker.checkString('var foo;').getValidationErrorCount() === 0);
            });
        });

        describe.skip('without var', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('that = this, self = this;')).to.have.no.errors();
            });

            it('should report "notthat = this, notself = this;"', function() {
                assert(checker.checkString('notthat = this; notself = this;').getValidationErrorCount() === 2);
            });

            it('should not report propery assignment "foo.bar = this; bar.foo = this"', function() {
                assert(checker.checkString('foo.bar = this; bar.foo = this').getValidationErrorCount() === 0);
            });
        });

        describe.skip('multiple var decl', function() {
            it('should not report "var that = this"', function() {
                expect(checker.checkString('var a = 1, that = this, self = this;')).to.have.no.errors();
            });

            it('should report "var notthat = this"', function() {
                assert(checker.checkString('var a = 1, notthat = this, notself = this;').getValidationErrorCount() === 2);
            });
        });
    });
});
