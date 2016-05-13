var expect = require('chai').expect;

var Checker = require('../../lib/checker');
var Errors = require('../../lib/errors');

describe('errors', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();

        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: true });
    });

    it('should show the correct rule for an error', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }');
        var error = errors.getErrorList()[0];

        expect(error.rule).to.equal('disallowQuotedKeysInObjects');
    });

    describe('getPosition', function() {
        it('should get position', function() {
            var position = Errors.getPosition({
                element: {
                    getNewlineCount: function() {
                        return 0;
                    },
                    getSourceCodeLength: function() {
                        return 1;
                    },
                    getLoc: function() {
                        return {
                            start: {
                                line: 1,
                                column: 10
                            },

                            end: {
                                line: 1,
                                column: 20
                            }
                        };
                    }
                }
            });

            expect(position).to.deep.equal({
                line: 1,
                column: 10
            });
        });

        it('should get position for element with length > 1', function() {
            var position = Errors.getPosition({
                element: {
                    getNewlineCount: function() {
                        return 0;
                    },
                    getSourceCodeLength: function() {
                        return 10;
                    },
                    getLoc: function() {
                        return {
                            start: {
                                line: 1,
                                column: 10
                            },

                            end: {
                                line: 1,
                                column: 20
                            }
                        };
                    }
                }
            });

            expect(position).to.deep.equal({
                line: 1,
                column: 15
            });
        });

        it('should set position on the first char for `validateQuoteMarks` rule', function() {
            var position = Errors.getPosition({
                rule: 'validateQuoteMarks',
                element: {
                    getNewlineCount: function() {
                        return 0;
                    },
                    getSourceCodeLength: function() {
                        return 10;
                    },
                    getLoc: function() {
                        return {
                            start: {
                                line: 1,
                                column: 10
                            },

                            end: {
                                line: 1,
                                column: 20
                            }
                        };
                    }
                }
            });

            expect(position).to.deep.equal({
                line: 1,
                column: 10
            });
        });
    });

    describe('pragma logic', function() {
        it('should suppress errors with disable comment', function() {
            var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 }');
            expect(errors).to.have.no.errors();
        });

        it('should suppress errors with disable comment followed by another more specific disable comment', function() {
            var errors = checker.checkString('//jscs:disable\n//jscs:disable someOtherRule\n\tvar x = { "a": 1 }');
            expect(errors).to.have.no.errors();
        });

        it('should not suppress errors with disable followed by enable comment', function() {
            var errors = checker.checkString('//jscs:disable\n//jscs:enable\n\tvar x = { "a": 1 }');
            expect(errors).to.have.errors();
        });

        it('should suppress errors with disable comment followed by enable comment after error location', function() {
            var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 };\n//jscs:enable');
            expect(errors).to.have.no.errors();
        });

        it('should suppress errors when specific rule is disabled', function() {
            var errors = checker.checkString('//jscs:disable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
            expect(errors).to.have.no.errors();
        });

        it('should not suppress errors when other rule is disabled', function() {
            var errors = checker.checkString('//jscs:disable someRuleName\n\tvar x = { "a": 1 }');
            expect(errors).to.have.errors();
        });

        it('should not suppress errors with disable followed by specific enable comment', function() {
            var errors = checker.checkString('//jscs:disable\n ' +
                '//jscs:enable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

            expect(errors).to.have.errors();
        });

        it('should suppress errors with disable followed by specific enable other comment', function() {
            var errors = checker.checkString('//jscs:disable\n ' +
                '//jscs:enable someRuleName\n\tvar x = { "a": 1 }');

            expect(errors).to.have.no.errors();
        });

        it('should not suppress errors with disable followed by specific enable other comment', function() {
            var errors = checker.checkString('//jscs:disable\n ' +
                '//jscs:enable someRuleName, disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

            expect(errors).to.have.errors();
        });

        it('should suppress errors with disable using liberal whitespace', function() {
            var str = '//   jscs:   disable   disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }';
            var errors = checker.checkString(str);
            expect(errors).to.have.no.errors();
        });

        it('should suppress errors with disable using block comment', function() {
            var str = '/*   jscs:   disable   disallowQuotedKeysInObjects */\n\tvar x = { "a": 1 }';
            var errors = checker.checkString(str);
            expect(errors).to.have.no.errors();
        });

        it('should suppress errors with disable using block comment and weird rule spacing', function() {
            var errors = checker.checkString('/* jscs: disable   someOtherRule, , ' +
                'disallowQuotedKeysInObjects */\nvar x = { "a": 1 }');

            expect(errors).to.have.no.errors();
        });
    });

    describe('add', function() {
        it('should not throw with good parameters', function() {
            var errors = checker.checkString('yay');

            errors.setCurrentRule('anyRule');
            errors.add('msg');

            var error = errors.getErrorList()[0];

            expect(error.rule).to.equal('anyRule');
        });

        it('adds parser error without `line` & `column` propertys even there is none',
            function() {
                var errors = checker.checkString('');

                errors.add(new Error('test'));

                var error = errors.getErrorList()[0];

                expect(error.line).to.equal(1);
                expect(error.column).to.equal(0);
            }
        );
    });

    describe('cast', function() {
        var errors;
        beforeEach(function() {
            errors = checker.checkString('yay');
        });

        it('should correctly set error', function() {
            errors.setCurrentRule('anyRule');
            errors.cast({
                message: 'msg',
                additional: 'test'
            });

            var error = errors.getErrorList()[0];

            expect(error.rule).to.equal('anyRule');
            expect(error.additional).to.equal('test');
        });
    });

    describe('explainError', function() {
        it('should explain error', function() {
            var errors = checker.checkString([
                '/* test */',
                'var x = { "a": 1 };',
                'var b;',
                'function c(){};',
                'var d = { "b": 2 };'
            ].join('\n'));
            var errorList = errors.getErrorList();

            expect(!!errors.explainError(errorList[0]).indexOf('--------^')).to.equal(true);
            expect(!!errors.explainError(errorList[1]).indexOf('--------^')).to.equal(true);
        });

        it('should provide correct indent for tabbed lines', function() {
            var errors = checker.checkString('\tvar x = { "a": 1 }');
            var error = errors.getErrorList()[0];

            expect(!/\t/.test(errors.explainError(error))).to.equal(true);
        });

        it('should explain colorized', function() {
            var errors = checker.checkString('var x = { "a": 1 };');
            var error = errors.getErrorList()[0];

            expect(errors.explainError(error, true).indexOf('\u001b')).to.not.equal(-1);
        });

        it('should show correct error message for unsupported rule error',
           function() {
                checker = new Checker({});

                checker.registerDefaultRules();
                checker.configure({ unsupported: true });

                var errors = checker.checkString('var x = { "a": 1 };');
                var error = errors.getErrorList()[0];

                expect(errors.explainError(error).indexOf(': Unsupported rule: unsupported')).to.equal(-1);
            }
        );
    });

    describe('filter', function() {
        it('filters the errorlist by the given function', function() {
            var errors = checker.checkString('var');
            errors.filter(function() {
                return false;
            });
            expect(errors).to.have.no.errors();
        });
    });

    describe('stripErrorList', function() {
        it('should stip error list to specified length', function() {
            var errors = checker.checkString('var x;');
            errors.add('msg1');
            errors.add('msg2');
            errors.add('msg3');
            errors.stripErrorList(2);
            expect(errors).to.have.error.count.equal(2);
            expect(errors.getErrorList()[0].message).to.equal('disallowQuotedKeysInObjects: msg1');
            expect(errors.getErrorList()[1].message).to.equal('disallowQuotedKeysInObjects: msg2');
        });
    });
});
