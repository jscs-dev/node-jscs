var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/camel-case-options', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal option names', function() {
        var error;
        try {
            checker.configure({ disallow_spaces_in_function_expression: { before_opening_round_brace: true } });
        } catch (e) {
            error = e;
        }
        assert.equal(
            error.message,
            'JSCS now accepts configuration options in camel case. ' +
            'Sorry for inconvenience. ' +
            'On the bright side, we tried to convert your jscs config to camel case.\n' +
            '----------------------------------------\n' +
            '{\n' +
            '    "disallowSpacesInFunctionExpression": {\n' +
            '        "beforeOpeningRoundBrace": true\n' +
            '    }\n' +
            '}\n' +
            '----------------------------------------\n'
        );
    });
    it('should not report legal option names', function() {
        var error;
        try {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
        } catch (e) {
            error = e;
        }
        assert(error === undefined);
    });
});
