var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-call-expression', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpacesInCallExpression: true });
    });

    it('should not report missing space before round brace in CallExpression', function() {
        assert(checker.checkString('var x = foobar();').isEmpty());
        assert(checker.checkString('var x = foo.bar();').isEmpty());
        assert(checker.checkString('var x = foo. bar();').isEmpty());
        assert(checker.checkString('var x = (foor .bar)();').isEmpty());
        assert(checker.checkString('var x = (function (){})();').isEmpty());
        assert(checker.checkString('var x = (function (){foobar();})();').isEmpty());
        assert(checker.checkString('(function(){ foobar(); })();').isEmpty());
        assert(checker.checkString('var x = function (){}();').isEmpty());
        assert(checker.checkString('var x = foobar\n\n\n\n();').isEmpty());
    });

    it('should not report missing space before round brace in NewExpression', function() {
        assert(checker.checkString('var x = new foobar();').isEmpty());
        assert(checker.checkString('var x = new foo.bar();').isEmpty());
        assert(checker.checkString('var x = new foo. bar();').isEmpty());
        assert(checker.checkString('var x = new (foo .bar)();').isEmpty());
        assert(checker.checkString('var x = new (function (){})();').isEmpty());
        assert(checker.checkString('var x = new (function (){foobar();})();').isEmpty());
        assert(checker.checkString('new (function(){ foobar(); })();').isEmpty());
        assert(checker.checkString('var x = new function (){}();').isEmpty());
    });

    it('should report space before round brace in CallExpression', function() {
        assert(checker.checkString('var x = foobar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = foo.bar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = foo. bar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = (foor .bar) ();').getErrorCount() === 1);
        assert(checker.checkString('var x = (function(){}) ();').getErrorCount() === 1);
        assert(checker.checkString('var x = (function(){foobar ();}) ();').getErrorCount() === 2);
        assert(checker.checkString('(function(){foobar ();}) ();').getErrorCount() === 2);
        assert(checker.checkString('var x = function (){} ();').getErrorCount() === 1);
    });

    it('should report space before round brace in NewExpression', function() {
        assert(checker.checkString('var x = new foobar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = new foo.bar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = new foo. bar ();').getErrorCount() === 1);
        assert(checker.checkString('var x = new (foor .bar) ();').getErrorCount() === 1);
        assert(checker.checkString('new (SomeClass.extend) ()').getErrorCount() === 1);
        assert(checker.checkString('new (SomeClass.extend ()) ').getErrorCount() === 1);
        assert(checker.checkString('var x = new (function(){new foobar ();}) ();').getErrorCount() === 2);
        assert(checker.checkString('new (function(){new foobar ();}) ();').getErrorCount() === 2);
        assert(checker.checkString('var x = new function (){} ();').getErrorCount() === 1);
    });

    it('should ignore NewExpression without parentheses', function() {
        assert(checker.checkString('var x = new foobar ;').isEmpty());
        assert(checker.checkString('var x = new foo.bar ;').isEmpty());
        assert(checker.checkString('var x = new foo. bar ;').isEmpty());
        assert(checker.checkString('var x = new (foor .bar) ;').isEmpty());
        assert(checker.checkString('var x = new (function(){}) ;').isEmpty());
        assert(checker.checkString('var x = new (function(){new foobar ;}) ;').isEmpty());
        assert(checker.checkString('new (function(){new foobar ;}) ;').isEmpty());
        assert(checker.checkString('var x = new function (){} ;').isEmpty());
    });

    it('should not report NewExpression with fitting parentheses (#1590)', function() {
        assert(checker.checkString('new (SomeClass.extend()); function test () {}').isEmpty());
    });

    it('should not report on round braces that do not belong to a NewExpression #(1594)', function() {
        checker.configure({ disallowSpacesInCallExpression: true, esnext: true });
        assert(checker.checkString('const newObj = new data.constructor;\n\nif (dataIsMap) {\n\n}').isEmpty());
    });
});
