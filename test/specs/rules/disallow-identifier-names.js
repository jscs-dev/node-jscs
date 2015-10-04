var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-identifier-names', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowIdentifierNames: ['temp', 'foo'] });
    });

    it('should report illegal identifier names', function() {
        expect(checker.checkString('temp = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('var temp = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('let temp = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('const temp = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('function fn(foo) {var temp = 1;}')).to.have.error.count.equal(2);
        expect(checker.checkString('fn(temp)')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('if(temp){}')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('for(temp = 0; temp<1; temp++){temp;}')).to.have.error.count.equal(4);
        expect(checker.checkString('obj[foo] = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('obj["foo"] = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
        expect(checker.checkString('obj.foo = 1;')).to.have.one.validation.error.from('disallowIdentifierNames');
    });

    it('should not report legal identifier names', function() {
        expect(checker.checkString('good = 1;')).to.have.no.errors();
        expect(checker.checkString('var good = 1;')).to.have.no.errors();
        expect(checker.checkString('let good = 1;')).to.have.no.errors();
        expect(checker.checkString('const good = 1;')).to.have.no.errors();
        expect(checker.checkString('function fn(fine) {var good = 1;}')).to.have.no.errors();
        expect(checker.checkString('fn(good)')).to.have.no.errors();
        expect(checker.checkString('if(good){}')).to.have.no.errors();
        expect(checker.checkString('for(good = 0; good < 1; good++){good;}')).to.have.no.errors();
        expect(checker.checkString('obj[good] = 1;')).to.have.no.errors();
        expect(checker.checkString('obj["good"] = 1;')).to.have.no.errors();
        expect(checker.checkString('obj.good = 1;')).to.have.no.errors();

        expect(checker.checkString('FOO = 1;')).to.have.no.errors();
    });

    it('should not report on object properties (#799)', function() {
        expect(checker.checkString('toString = 1;')).to.have.no.errors();
        expect(checker.checkString('var valueOf = 1;')).to.have.no.errors();
        expect(checker.checkString('fn(propertyIsEnumerable)')).to.have.no.errors();
        expect(checker.checkString('obj.isPrototypeOf = 1;')).to.have.no.errors();
    });
});
