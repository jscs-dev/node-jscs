var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterObjectKeys: true });
    });

    it('should report missing space after keys', function() {
        expect(checker.checkString('var x = { a : 1, b: 2 };'))
          .to.have.one.validation.error.from('requireSpaceAfterObjectKeys');
        expect(checker.checkString('var x = { abc: 1, b: 2 };')).to.have.error.count.equal(2);
    });

    it('should not report space after keys', function() {
        expect(checker.checkString('var x = { a : 1, bcd : 2 };')).to.have.no.errors();
    });

    it('should not report shorthand object properties', function() {
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
        expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
    });

    it('should report mixed shorthand and normal object properties', function() {
        expect(checker.checkString('var x = { a:1, b };'))
          .to.have.one.validation.error.from('requireSpaceAfterObjectKeys');
    });

    it('should not report es5 getters/setters #1037', function() {
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });

    describe('es6', function() {
        beforeEach(function() {
        });

        it('should allow object literal spreading with spread at end', function() {
            expect(checker.checkString(
                'var b = {};\n' +
                'var x = {a : 1, ...b};'
            )).to.have.no.errors();
        });

        it('should allow object literal spreading with spread at beginning', function() {
            expect(checker.checkString(
                'var b = {};\n' +
                'var x = {...b, a : 1};'
            )).to.have.no.errors();
        });

        it('should report es6-methods without a space. #1013', function() {
            expect(checker.checkString('var x = { a() { } };'))
              .to.have.one.validation.error.from('requireSpaceAfterObjectKeys');
        });

        it('should not report es6-methods with a space. #1013', function() {
            expect(checker.checkString('var x = { a () { } };')).to.have.no.errors();
        });

        it('should report if no space after computed property names #1406', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey]: "myKeyValue"',
                    '};'
                ].join('\n'))).to.have.one.validation.error.from('requireSpaceAfterObjectKeys');
        });

        it('should not report if space after computed property names #1406', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey] : "myKeyValue",',
                      '[otherKey] : "myOtherValue"',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

        it('should report if no space after computed property names #1742', function() {
            expect(checker.checkString([
                    'var a = {',
                      '[block + \'--default\']: this.props.navStyle === \'default\',',
                      '[1 + 1 + 3]: 1',
                    '};'
                ].join('\n'))).to.have.error.count.equal(2);
        });

        it('should not report if space after computed property names #1742', function() {
            expect(checker.checkString([
                    'var a = {',
                      '[block + \'--default\'] : this.props.navStyle === \'default\',',
                      '[1 + 1 + 3] : 1',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

    });

});
