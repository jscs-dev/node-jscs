var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-spaces-inside-function-calls-with-single-argument', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('all', function() {
        beforeEach(function() {
            checker.configure({disallowSpacesInsideFunctionCalls: true});
        });

        it('should report with a space before a single argument', function() {
            expect(checker.checkString('foobar( "baz")')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });

        it('should report with a space after a single argument', function() {
            expect(checker.checkString('foobar("baz" )')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });

        it('should not report with no space around a single argument', function() {
            expect(checker.checkString('foobar("baz")')).to.have.no.errors();
        });

        it('should report with spaces around multiple arguments', function() {
            expect(checker.checkString('foobar( "baz", "qux")')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');

            expect(checker.checkString('foobar("baz", "qux" )')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });

        it('should report with no arguments and a space', function() {
            expect(checker.checkString('foobar( )')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });
    });

    describe('onlySingleArgument', function() {
        beforeEach(function() {
            checker.configure({disallowSpacesInsideFunctionCalls: {
                onlySingleArgument: true
            }});
        });

        it('should report with a space before a single argument', function() {
            expect(checker.checkString('foobar( "baz")')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });

        it('should report with a space after a single argument', function() {
            expect(checker.checkString('foobar("baz" )')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });

        it('should not report with no space around a single argument', function() {
            expect(checker.checkString('foobar("baz")')).to.have.no.errors();
        });

        it('should not report with spaces around multiple arguments', function() {
            expect(checker.checkString('foobar( "baz", "qux")')).to.have.no.errors();

            expect(checker.checkString('foobar("baz", "qux" )')).to.have.no.errors();
        });
    });

    describe('onlyMultipleArguments', function() {
        beforeEach(function() {
            checker.configure({disallowSpacesInsideFunctionCalls: {
                onlyMultipleArguments: true
            }});
        });

        it('should not report with a space before a single argument', function() {
            expect(checker.checkString('foobar( "baz")')).to.have.no.errors();
        });

        it('should not report with a space after a single argument', function() {
            expect(checker.checkString('foobar("baz" )')).to.have.no.errors();
        });

        it('should not report with no space around a single argument', function() {
            expect(checker.checkString('foobar("baz")')).to.have.no.errors();
        });

        it('should report with spaces around multiple arguments', function() {
            expect(checker.checkString('foobar( "baz", "qux")')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');

            expect(checker.checkString('foobar("baz", "qux" )')).to.
                have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
        });
    });

    describe('exceptions', function() {
        describe('quotes', function() {
            beforeEach(function() {
                checker.configure({
                    disallowSpacesInsideFunctionCalls: {
                        only: ['"', '\'']
                    }
                });
            });

            it('should report for single quoted arguments', function() {
                expect(checker.checkString('foobar( \'baz\')')).to.
                    have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
            });

            it('should report for double quoted arguments', function() {
                expect(checker.checkString('foobar( "baz")')).to.
                    have.one.validation.error.from('disallowSpacesInsideFunctionCalls');
            });

            it('should not for non-quoted arguments', function() {
                expect(checker.checkString('foobar( baz )')).to.have.no.errors();
            });
        });
    });
});
