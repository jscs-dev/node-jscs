var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-identical-destructuring-names', function() {
    var checker;

    function assertNum(str, num) {
        expect(checker.checkString(str)).to.have.error.count.equal(num);
    }

    function assertEmpty(str) {
        assertNum(str, 0);
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowIdenticalDestructuringNames: true });
    });

    it('should report identical destructuring names', function() {
        assertNum('var { a: a } = obj;', 1);
    });

    it('should report multiple identical destructuring names', function() {
        assertNum('var { a: a, b: b, c: c } = obj;', 3);
    });

    it('should report only identical destructuring names', function() {
        assertNum('var { a, b: b } = obj;', 1);
    });

    it('should not report other destructuring', function() {
        assertEmpty('var { a } = obj;');
        assertEmpty('var { a, b, c } = obj;');
        assertEmpty('var { a: a1, b: b2, c: c3 } = obj;');
        // TODO: 3.0
        // Use the shorthand form of destructuring instead
        // assertEmpty('var { [a]: a } = obj;');
    });
});
