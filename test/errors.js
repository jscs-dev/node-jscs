var Checker = require('../lib/checker');
var assert = require('assert');

describe('modules/errors', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();

        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: true });
    });

    it('should provide correct indent for tabbed lines', function() {
        var errors = checker.checkString('\tvar x = { "a": 1 }');
        var error = errors.getErrorList()[0];

        assert.ok(!/\t/.test(errors.explainError(error)));
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
        before(function() {
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
