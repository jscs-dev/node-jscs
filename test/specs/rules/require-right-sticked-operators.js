var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-right-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireRightStickedOperators: ['+'] });
    });
    it('should output correct deprecation notice', function() {
        var errors = checker.checkString('var a = b + c; var a = b + c;').getErrorList();
        assert(errors.length === 1);

        var error = errors[0];
        assert(error.line === 1 && error.column === 0);
        assert(error.message === 'The requireRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceAfterBinaryOperators' +
            '\ndisallowSpaceAfterPrefixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression');
    });
});
