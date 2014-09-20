var Checker = require('../../lib/checker');
var assert = require('assert');
var fs = require('fs');
var fixture = fs.readFileSync(__dirname + '/../data/validate-indentation.js', 'utf8');

describe('rules/validate-indentation', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    function checkErrors(string, expectedErrorLines) {
        var errors = checker.checkString(string).getErrorList().sort(function(a, b) {
            return a.line - b.line;
        });

        errors.forEach(function(error, i) {
            assert(error.line === expectedErrorLines[i], 'did not expect an error on line ' + error.line);
        });
        expectedErrorLines.forEach(function(line, i) {
            assert(errors[i] && errors[i].line === line, 'expected an error on line ' + line);
        });
        assert(expectedErrorLines.length === errors.length);
    }

    it('should validate tab indentation properly', function() {
        checker.configure({ validateIndentation: '\t' });
        checkErrors('if (a){\n\tb=c;\n\t\tc=d;\ne=f;\n}', [3, 4]);
    });

    it('should validate 4 spaces indentation properly', function() {
        checker.configure({ validateIndentation: 4 });
        checkErrors('if (a){\n    b=c;\n      c=d;\n e=f;\n}', [3, 4]);
    });

    it('should validate 2 spaces indentation properly', function() {
        checker.configure({ validateIndentation: 2 });
        checkErrors(fixture, [
            5,
            10,
            11,
            15,
            16,
            23,
            29,
            30,
            36,
            38,
            39,
            40,
            46,
            54,
            114,
            120,
            124,
            127,
            134,
            139,
            145,
            149,
            152,
            159,
            168,
            176,
            184,
            186,
            200,
            202,
            214,
            218,
            220,
            330,
            331,
            371,
            372,
            375,
            376,
            379,
            380,
            386,
            388,
            399,
            401,
            405,
            407,
            414,
            416,
            421,
            423,
            440,
            441,
            447,
            448,
            454,
            455,
            461,
            462,
            467,
            472
        ]);
    });
});
