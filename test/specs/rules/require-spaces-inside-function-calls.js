var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-spaces-inside-function-calls-with-single-argument', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('all', function() {
        beforeEach(function() {
            checker.configure({requireSpacesInsideFunctionCalls: true});
        });

        it('should report with no space before a single argument', function() {
            expect(checker.checkString('foobar("baz" )')).to.
                have.one.validation.error.from('requireSpacesInsideFunctionCalls');
        });

        it('should report with no space after a single argument', function() {
            expect(checker.checkString('foobar( "baz")')).to.
                have.one.validation.error.from('requireSpacesInsideFunctionCalls');
        });

        it('should not report with space around a single argument', function() {
            expect(checker.checkString('foobar( "baz" )')).to.have.no.errors();
        });

        it('should report with no spaces around multiple arguments', function() {
            expect(checker.checkString('foobar( "baz", "qux")')).to.
                have.one.validation.error.from('requireSpacesInsideFunctionCalls');

            expect(checker.checkString('foobar("baz", "qux" )')).to.
                have.one.validation.error.from('requireSpacesInsideFunctionCalls');
        });

        it('should not report with spaces around multiple arguments', function() {
            expect(checker.checkString('foobar( "baz", "qux" )')).to.have.no.errors();
        });

        it('should not report with no arguments and no space', function() {
            expect(checker.checkString('foobar()')).to.have.no.errors();
        });
    });

    describe('exceptSingleArgument', function() {
        beforeEach(function() {
            checker.configure({requireSpacesInsideFunctionCalls: {
                exceptSingleArgument: true
            }});
        });

        it('should not report with no space around a single argument', function() {
            expect(checker.checkString('foobar("baz")')).to.have.no.errors();
        });

        it('should report with no space around multiple arguments', function() {
            expect(checker.checkString('foobar("baz", "bar")')).to.
                have.validation.errors.from('requireSpacesInsideFunctionCalls');
        });
    });

    describe('exceptMultipleArguments', function() {
        beforeEach(function() {
            checker.configure({requireSpacesInsideFunctionCalls: {
                exceptMultipleArguments: true
            }});
        });

        it('should not report with no space around multiple arguments', function() {
            expect(checker.checkString('foobar("bar", "baz")')).to.have.no.errors();
        });

        it('should report with no space around a single argument', function() {
            expect(checker.checkString('foobar("baz")')).to.
                have.validation.errors.from('requireSpacesInsideFunctionCalls');
        });
    });

    describe('exceptNoArguments', function() {
        beforeEach(function() {
            checker.configure({requireSpacesInsideFunctionCalls: {
                exceptNoArguments: false
            }});
        });

        it('should not report with a space inside an empty function call', function() {
            expect(checker.checkString('foobar( )')).to.have.no.errors();
        });

        it('should report with no space around inside an empty function call', function() {
            expect(checker.checkString('foobar()')).to.
                have.one.validation.error.from('requireSpacesInsideFunctionCalls');
        });
    });

    describe('exceptions', function() {
        describe('quotes', function() {
            beforeEach(function() {
                checker.configure({
                    requireSpacesInsideFunctionCalls: {
                        except: ['"', '\'']
                    }
                });
            });

            it('should not report for single quoted arguments', function() {
                expect(checker.checkString('foobar(\'baz\')')).to.have.no.errors();
            });

            it('should not report for double quoted arguments', function() {
                expect(checker.checkString('foobar("baz")')).to.have.no.errors();
            });

            it('should report for non-quoted arguments', function() {
                expect(checker.checkString('foobar(baz)')).to.
                    have.validation.errors.from('requireSpacesInsideFunctionCalls');
            });
        });
    });
});
