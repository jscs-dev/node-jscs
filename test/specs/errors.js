var Checker = require('../../lib/checker');
var expect = require('chai').expect;

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
        var errors = checker.checkString('//   jscs:   disable   disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
        expect(errors).to.have.no.errors();
    });

    it('should suppress errors with disable using block comment', function() {
        var errors = checker.checkString('/*   jscs:   disable   disallowQuotedKeysInObjects */\n\tvar x = { "a": 1 }');
        expect(errors).to.have.no.errors();
    });

    it('should suppress errors with disable using block comment and weird rule spacing', function() {
        var errors = checker.checkString('/* jscs: disable   someOtherRule, , ' +
            'disallowQuotedKeysInObjects */\nvar x = { "a": 1 }');

        expect(errors).to.have.no.errors();
    });

    describe('add', function() {
        var errors;
        beforeEach(function() {
            errors = checker.checkString('yay');
        });

        it('should throw an error on invalid line type', function() {
            expect(function() {
                errors.add('msg', '0');
            }).to.throw();
        });

        it('should throw an error on invalid line value', function() {
            expect(function() {
                errors.add('msg', 0);
            }).to.throw();
        });

        it('should throw an error on invalid column type', function() {
            expect(function() {
                errors.add('msg', 1, '2');
            }).to.throw();
        });

        it('should throw an error on invalid column value', function() {
            expect(function() {
                errors.add('msg', 1, -1);
            }).to.throw();
        });

        it('should not throw with good parameters', function() {
            errors.setCurrentRule('anyRule');
            errors.add('msg', 1, 0);

            var error = errors.getErrorList()[0];

            expect(error.rule).to.equal('anyRule');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(0);
        });
    });

    describe('cast', function() {
        var errors;
        beforeEach(function() {
            errors = checker.checkString('yay');
        });

        it('should throw an error on invalid line type', function() {
            expect(function() {
                errors.cast({
                    message: 'msg',
                    line: '0'
                });
            }).to.throw();
        });

        it('should throw an error on invalid line value', function() {
            expect(function() {
                errors.cast({
                    message: 'msg',
                    line: 0
                });
            }).to.throw();
        });

        it('should throw an error on invalid column type', function() {
            expect(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: '2'
                });
            }).to.throw();
        });

        it('should throw an error on invalid column value', function() {
            expect(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: -1
                });
            }).to.throw();
        });

        it('should throw without "additional" argument', function() {
            expect(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: -1
                });
            }).to.throw();
        });

        it('should correctly set error', function() {
            errors.setCurrentRule('anyRule');
            errors.cast({
                message: 'msg',
                column: 0,
                line: 1,
                additional: 'test'
            });

            var error = errors.getErrorList()[0];

            expect(error.rule).to.equal('anyRule');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(0);
            expect(error.additional).to.equal('test');
        });
    });

    describe('add with verbose', function() {
        var errors;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                disallowQuotedKeysInObjects: true,
                verbose: true
            });

            errors = checker.checkString('yay');
        });

        it('should prepend rule name to error message', function() {
            errors.setCurrentRule('anyRule');
            errors.add('msg', 1, 0);

            var error = errors.getErrorList()[0];

            expect(error.message).to.equal('anyRule: msg');
        });

        it('should dump a stack of Error', function() {
            errors._verbose = true;
            errors.add(Error('test'), 1, 0);

            expect(errors).to.have.one.error();
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

        it('should show correct error message for "verbose" option and unsupported rule error',
           function() {
                checker = new Checker({ verbose: true });

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
            errors.add('msg1', 1, 0);
            errors.add('msg2', 1, 1);
            errors.add('msg3', 1, 2);
            errors.stripErrorList(2);
            expect(errors).to.have.error.count.equal(2);
            expect(errors.getErrorList()[0].message).to.equal('msg1');
            expect(errors.getErrorList()[0].line).to.equal(1);
            expect(errors.getErrorList()[0].column).to.equal(0);
            expect(errors.getErrorList()[1].message).to.equal('msg2');
            expect(errors.getErrorList()[1].line).to.equal(1);
            expect(errors.getErrorList()[1].column).to.equal(1);
        });
    });
});
