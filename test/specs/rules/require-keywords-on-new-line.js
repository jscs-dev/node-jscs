var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-keywords-on-new-line', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal keyword placement', function() {
        checker.configure({ requireKeywordsOnNewLine: ['else'] });
        expect(checker.checkString(
                'if (x) {\n' +
                    'x++;\n' +
                '} else {\n' +
                    'x--;\n' +
                '}'
            )).to.have.one.validation.error.from('requireKeywordsOnNewLine');
    });
    it('should not report legal keyword placement', function() {
        checker.configure({ requireKeywordsOnNewLine: ['else'] });
        expect(checker.checkString(
                'if (x) {\n' +
                    'x++;\n' +
                '}\n' +
                'else {\n' +
                    'x--;\n' +
                '}'
            )).to.have.no.errors();
    });
});
