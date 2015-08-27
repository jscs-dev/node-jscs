var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-call-expression', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpacesInCallExpression: true });
    });

    it('should not report missing space before round brace in CallExpression', function() {
        expect(checker.checkString('var x = foobar();')).to.have.no.errors();
        expect(checker.checkString('var x = foo.bar();')).to.have.no.errors();
        expect(checker.checkString('var x = foo. bar();')).to.have.no.errors();
        expect(checker.checkString('var x = (foor .bar)();')).to.have.no.errors();
        expect(checker.checkString('var x = (function (){})();')).to.have.no.errors();
        expect(checker.checkString('var x = (function (){foobar();})();')).to.have.no.errors();
        expect(checker.checkString('(function(){ foobar(); })();')).to.have.no.errors();
        expect(checker.checkString('var x = function (){}();')).to.have.no.errors();
    });

    it('should report space before round brace in CallExpression', function() {
        expect(checker.checkString('var x = foobar ();'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = foo.bar ();'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = foo. bar ();'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = (foor .bar) ();'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = (function(){}) ();'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = (function(){foobar ();}) ();')).to.have.validation.error.count.which.equals(2);
        expect(checker.checkString('(function(){foobar ();}) ();')).to.have.validation.error.count.which.equals(2);
        expect(checker.checkString('var x = function (){} ();'))
            .to.have.one.error.from('ruleName');
    });
});
