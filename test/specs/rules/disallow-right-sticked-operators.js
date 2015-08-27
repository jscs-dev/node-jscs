var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-right-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowRightStickedOperators: ['+'] });
    });
    it('should output correct deprecation notice', function() {
        var errors = checker.checkString('var a = b +c; var a = b +c;').getErrorList();
        expect(errors.length).to.equal(1);

        var error = errors[0];
        expect(error.line).to.equal(1);
        expect(error.column).to.equal(0);
        expect(error.message).to.equal(
            'The disallowRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceAfterBinaryOperators' +
            '\nrequireSpaceAfterPrefixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression'
        );
    });
});
