var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowArrowFunctions: true });
    });

    it('should report use of arrow function', function() {
        expect(checker.checkString('a.map(n => n + 1);')).to.have.one.validation.error.from('disallowArrowFunctions');
    });

    it('should report use of multi line arrow function', function() {
        expect(checker.checkString([
            'a.map(n => {',
                'return n + 1;',
            '});'
        ].join('\n'))).to.have.one.validation.error.from('disallowArrowFunctions');
    });
});
