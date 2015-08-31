var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-left-sticked-operators', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowLeftStickedOperators: ['+'] });
    });

    it('should output correct deprecation notice', function() {
        var errors = checker.checkString('var a = b+ c; var a = b+ c;');
        expect(errors).to.have.one.error.from('disallowLeftStickedOperators');

        var error = errors.getErrorList()[0];
        expect(error.element).to.equal(null);
        expect(error.offset).to.equal(0);
        expect(error.message).to.equal('The disallowLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceBeforeBinaryOperators' +
            '\nrequireSpaceBeforePostfixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression');
    });
});
