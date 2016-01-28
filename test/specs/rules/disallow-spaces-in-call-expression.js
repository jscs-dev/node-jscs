var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-spaces-in-call-expression', function() {
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
        expect(checker.checkString('var x = foobar\n\n\n\n();')).to.have.no.errors();
    });

    it('should not report missing space before round brace in NewExpression', function() {
        expect(checker.checkString('var x = new foobar();')).to.have.no.errors();
        expect(checker.checkString('var x = new foo.bar();')).to.have.no.errors();
        expect(checker.checkString('var x = new foo. bar();')).to.have.no.errors();
        expect(checker.checkString('var x = new (foo .bar)();')).to.have.no.errors();
        expect(checker.checkString('var x = new (function (){})();')).to.have.no.errors();
        expect(checker.checkString('var x = new (function (){foobar();})();')).to.have.no.errors();
        expect(checker.checkString('new (function(){ foobar(); })();')).to.have.no.errors();
        expect(checker.checkString('var x = new function (){}();')).to.have.no.errors();
    });

    it('should report space before round brace in CallExpression', function() {
        expect(checker.checkString('var x = foobar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = foo.bar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = foo. bar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = (foor .bar) ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = (function(){}) ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = (function(){foobar ();}) ();')).to.have.error.count.equal(2);
        expect(checker.checkString('(function(){foobar ();}) ();')).to.have.error.count.equal(2);
        expect(checker.checkString('var x = function (){} ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
    });

    it('should report space before round brace in NewExpression', function() {
        expect(checker.checkString('var x = new foobar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = new foo.bar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = new foo. bar ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = new (foor .bar) ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('new (SomeClass.extend) ()'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('new (SomeClass.extend ()) '))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
        expect(checker.checkString('var x = new (function(){new foobar ();}) ();')).to.have.error.count.equal(2);
        expect(checker.checkString('new (function(){new foobar ();}) ();')).to.have.error.count.equal(2);
        expect(checker.checkString('var x = new function (){} ();'))
          .to.have.one.validation.error.from('disallowSpacesInCallExpression');
    });

    it('should ignore NewExpression without parentheses', function() {
        expect(checker.checkString('var x = new foobar ;')).to.have.no.errors();
        expect(checker.checkString('var x = new foo.bar ;')).to.have.no.errors();
        expect(checker.checkString('var x = new foo. bar ;')).to.have.no.errors();
        expect(checker.checkString('var x = new (foor .bar) ;')).to.have.no.errors();
        expect(checker.checkString('var x = new (function(){}) ;')).to.have.no.errors();
        expect(checker.checkString('var x = new (function(){new foobar ;}) ;')).to.have.no.errors();
        expect(checker.checkString('new (function(){new foobar ;}) ;')).to.have.no.errors();
        expect(checker.checkString('var x = new function (){} ;')).to.have.no.errors();
    });

    it('should not report NewExpression with fitting parentheses (#1590)', function() {
        expect(checker.checkString('new (SomeClass.extend()); function test () {}')).to.have.no.errors();
    });

    it('should not report on round braces that do not belong to a NewExpression #(1594)', function() {
        checker.configure({ disallowSpacesInCallExpression: true });
        expect(checker.checkString('const newObj = new data.constructor;\n\nif (dataIsMap) {\n\n}'))
          .to.have.no.errors();
    });
});
