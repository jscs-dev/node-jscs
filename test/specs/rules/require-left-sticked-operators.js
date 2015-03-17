var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-left-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireLeftStickedOperators: ['+'] });
    });
    it('should output correct deprecation notice', function() {
        var errors = checker.checkString('var a = b + c; var a = b + c;').getErrorList();
        assert(errors.length === 1);

        var error = errors[0];
        assert(error.line === 1 && error.column === 0);
        assert(error.message === 'The requireLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceBeforeBinaryOperators' +
            '\ndisallowSpaceBeforePostfixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression');
    });
});
