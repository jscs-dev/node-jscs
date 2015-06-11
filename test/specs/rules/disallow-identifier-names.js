var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-identifier-names', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowIdentifierNames: ['temp', 'foo'] });
    });

    it('should report illegal identifier names', function() {
        assert(checker.checkString('temp = 1;').getErrorCount() === 1);
        assert(checker.checkString('var temp = 1;').getErrorCount() === 1);
        assert(checker.checkString('let temp = 1;').getErrorCount() === 1);
        assert(checker.checkString('const temp = 1;').getErrorCount() === 1);
        assert(checker.checkString('function fn(foo) {var temp = 1;}').getErrorCount() === 2);
        assert(checker.checkString('fn(temp)').getErrorCount() === 1);
        assert(checker.checkString('if(temp){}').getErrorCount() === 1);
        assert(checker.checkString('for(temp = 0; temp<1; temp++){temp;}').getErrorCount() === 4);
        assert(checker.checkString('obj[foo] = 1;').getErrorCount() === 1);
        assert(checker.checkString('obj["foo"] = 1;').getErrorCount() === 1);
        assert(checker.checkString('obj.foo = 1;').getErrorCount() === 1);
    });

    it('should not report legal identifier names', function() {
        assert(checker.checkString('good = 1;').isEmpty());
        assert(checker.checkString('var good = 1;').isEmpty());
        assert(checker.checkString('let good = 1;').isEmpty());
        assert(checker.checkString('const good = 1;').isEmpty());
        assert(checker.checkString('function fn(fine) {var good = 1;}').isEmpty());
        assert(checker.checkString('fn(good)').isEmpty());
        assert(checker.checkString('if(good){}').isEmpty());
        assert(checker.checkString('for(good = 0; good < 1; good++){good;}').isEmpty());
        assert(checker.checkString('obj[good] = 1;').isEmpty());
        assert(checker.checkString('obj["good"] = 1;').isEmpty());
        assert(checker.checkString('obj.good = 1;').isEmpty());

        assert(checker.checkString('FOO = 1;').isEmpty());
    });

    it('should not report on object properties (#799)', function() {
        assert(checker.checkString('toString = 1;').isEmpty());
        assert(checker.checkString('var valueOf = 1;').isEmpty());
        assert(checker.checkString('fn(propertyIsEnumerable)').isEmpty());
        assert(checker.checkString('obj.isPrototypeOf = 1;').isEmpty());
    });
});
