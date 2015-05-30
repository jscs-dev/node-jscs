var Checker = require('../../lib/checker');
var assert = require('assert');

describe('modules/errors', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();

        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: true });
    });

    it('should show the correct rule for an error', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }');
        var error = errors.getErrorList()[0];

        assert.ok(error.rule === 'disallowQuotedKeysInObjects');
    });

    it('should suppress errors with disable comment', function() {
        var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable comment followed by another more specific disable comment', function() {
        var errors = checker.checkString('//jscs:disable\n//jscs:disable someOtherRule\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors with disable followed by enable comment', function() {
        var errors = checker.checkString('//jscs:disable\n//jscs:enable\n\tvar x = { "a": 1 }');
        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable comment followed by enable comment after error location', function() {
        var errors = checker.checkString('//jscs:disable\n\tvar x = { "a": 1 };\n//jscs:enable');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors when specific rule is disabled', function() {
        var errors = checker.checkString('//jscs:disable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors when other rule is disabled', function() {
        var errors = checker.checkString('//jscs:disable someRuleName\n\tvar x = { "a": 1 }');
        assert.ok(!errors.isEmpty());
    });

    it('should not suppress errors with disable followed by specific enable comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable followed by specific enable other comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable someRuleName\n\tvar x = { "a": 1 }');

        assert.ok(errors.isEmpty());
    });

    it('should not suppress errors with disable followed by specific enable other comment', function() {
        var errors = checker.checkString('//jscs:disable\n ' +
            '//jscs:enable someRuleName, disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');

        assert.ok(!errors.isEmpty());
    });

    it('should suppress errors with disable using liberal whitespace', function() {
        var errors = checker.checkString('//   jscs:   disable   disallowQuotedKeysInObjects\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable using block comment', function() {
        var errors = checker.checkString('/*   jscs:   disable   disallowQuotedKeysInObjects */\n\tvar x = { "a": 1 }');
        assert.ok(errors.isEmpty());
    });

    it('should suppress errors with disable using block comment and weird rule spacing', function() {
        var errors = checker.checkString('/* jscs: disable   someOtherRule, , ' +
            'disallowQuotedKeysInObjects */\nvar x = { "a": 1 }');

        assert.ok(errors.isEmpty());
    });

    describe('add', function() {
        var errors;
        beforeEach(function() {
            errors = checker.checkString('yay');
        });

        it('should throw an error on invalid line type', function() {
            assert.throws(function() {
                errors.add('msg', '0');
            });
        });

        it('should throw an error on invalid line value', function() {
            assert.throws(function() {
                errors.add('msg', 0);
            });
        });

        it('should throw an error on invalid column type', function() {
            assert.throws(function() {
                errors.add('msg', 1, '2');
            });
        });

        it('should throw an error on invalid column value', function() {
            assert.throws(function() {
                errors.add('msg', 1, -1);
            });
        });

        it('should not throw with good parameters', function() {
            errors.setCurrentRule('anyRule');
            errors.add('msg', 1, 0);

            var error = errors.getErrorList()[0];

            assert.equal(error.rule, 'anyRule');
            assert.equal(error.line, 1);
            assert.equal(error.column, 0);
        });
    });

    describe('cast', function() {
        var errors;
        beforeEach(function() {
            errors = checker.checkString('yay');
        });

        it('should throw an error on invalid line type', function() {
            assert.throws(function() {
                errors.cast({
                    message: 'msg',
                    line: '0'
                });
            });
        });

        it('should throw an error on invalid line value', function() {
            assert.throws(function() {
                errors.cast({
                    message: 'msg',
                    line: 0
                });
            });
        });

        it('should throw an error on invalid column type', function() {
            assert.throws(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: '2'
                });
            });
        });

        it('should throw an error on invalid column value', function() {
            assert.throws(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: -1
                });
            });
        });

        it('should throw without "additional" argument', function() {
            assert.throws(function() {
                errors.cast({
                    message: 'msg',
                    line: 1,
                    column: -1
                });
            });
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

            assert.equal(error.rule, 'anyRule');
            assert.equal(error.line, 1);
            assert.equal(error.column, 0);
            assert.equal(error.additional, 'test');
        });
    });

    describe('add with verbose', function() {
        var errors;
        beforeEach(function() {
            checker = new Checker({verbose: true});
            checker.registerDefaultRules();
            checker.configure({ disallowQuotedKeysInObjects: true });

            errors = checker.checkString('yay');
        });

        it('should prepend rule name to error message', function() {
            errors.setCurrentRule('anyRule');
            errors.add('msg', 1, 0);

            var error = errors.getErrorList()[0];

            assert.equal(error.message, 'anyRule: msg');
        });

        it('should dump a stack of Error', function() {
            errors._verbose = true;
            errors.add(Error('test'), 1, 0);

            assert.equal(errors.getErrorCount(), 1);
        });
    });

    describe('explainError', function() {
        it('should explain error', function() {
            var errors = checker.checkString([
                '/* test */',
                'var x = { "a": 1 };',
                'var b;',
                'function c(){};',
                'var d = { "b": 2 };',
            ].join('\n'));
            var errorList = errors.getErrorList();

            assert.ok(errors.explainError(errorList[0]).indexOf('--------^'));
            assert.ok(errors.explainError(errorList[1]).indexOf('--------^'));
        });

        it('should provide correct indent for tabbed lines', function() {
            var errors = checker.checkString('\tvar x = { "a": 1 }');
            var error = errors.getErrorList()[0];

            assert.ok(!/\t/.test(errors.explainError(error)));
        });

        it('should explain colorized', function() {
            var errors = checker.checkString('var x = { "a": 1 };');
            var error = errors.getErrorList()[0];

            assert.ok(errors.explainError(error, true).indexOf('\u001b') !== -1);
        });

        it('should show correct error message for "verbose" option and unsupported rule error',
           function() {
                checker = new Checker({ verbose: true });

                checker.registerDefaultRules();
                checker.configure({ unsupported: true });

                var errors = checker.checkString('var x = { "a": 1 };');
                var error = errors.getErrorList()[0];

                assert.equal(
                    errors.explainError(error).indexOf(': Unsupported rule: unsupported'), -1
                );
            }
        );
    });

    describe('filter', function() {
        it('filters the errorlist by the given function', function() {
            var errors = checker.checkString('var');
            errors.filter(function() {
                return false;
            });
            assert(errors.isEmpty());
        });
    });

    describe('stripErrorList', function() {
        it('should stip error list to specified length', function() {
            var errors = checker.checkString('var x;');
            errors.add('msg1', 1, 0);
            errors.add('msg2', 1, 1);
            errors.add('msg3', 1, 2);
            errors.stripErrorList(2);
            assert.equal(errors.getErrorCount(), 2);
            assert.equal(errors.getErrorList()[0].message, 'msg1');
            assert.equal(errors.getErrorList()[0].line, 1);
            assert.equal(errors.getErrorList()[0].column, 0);
            assert.equal(errors.getErrorList()[1].message, 'msg2');
            assert.equal(errors.getErrorList()[1].line, 1);
            assert.equal(errors.getErrorList()[1].column, 1);
        });
    });
});
