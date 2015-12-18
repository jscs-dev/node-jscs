var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-dangling-underscores', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('misconfiguration', function() {
        it('should error when provided a non-array allExcept', function() {
            expect(function() {
                checker.configure({ disallowDanglingUnderscores: { allExcept: true } });
            }).to.throw();
        });

        it('should not set property `__proto__` to `true` value (#2026)', function() {
            var old = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');

            if (old === undefined) {
                return;
            }

            Object.defineProperty(Object.prototype, '__proto__', {
                set: function(newProto) {
                    expect(newProto).to.not.equal(true);
                }
            });

            expect(function() {
                checker.configure({ disallowDanglingUnderscores: true });
            }).to.not.throw();

            // Beware, if assertion will be incorrect it will break all the subsequent tests
            Object.defineProperty(Object.prototype, '__proto__', old);
        });
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: true });
        });

        it('should report leading underscores', function() {
            expect(checker.checkString('var _x = "x";'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
        });

        it('should report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x";'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
        });

        it('should report trailing underscores in member expressions', function() {
            expect(checker.checkString('var x = this._privateField;'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
            expect(checker.checkString('var x = instance._protectedField;'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
        });

        it('should report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x";'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
        });

        it('should not report inner underscores', function() {
            expect(checker.checkString('var x_y = "x";')).to.have.no.errors();
        });

        it('should not report no underscores', function() {
            expect(checker.checkString('var xy = "x";')).to.have.no.errors();
        });
    });

    describe('option value true: default exceptions', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: true });
        });

        it('should not report the prototype property', function() {
            expect(checker.checkString('var proto = obj.__proto__;')).to.have.no.errors();
        });

        it('should not report underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report node globals', function() {
            expect(checker.checkString('var a = __dirname + __filename;')).to.have.no.errors();
        });

        it('should not report the super constructor reference created by node\'s util.inherits', function() {
            expect(checker.checkString('Inheritor.super_.call(this);')).to.have.no.errors();
        });
    });

    describe('exceptions', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: { allExcept: ['_test', 'test_', '_test_', '__test'] } });
        });

        it('should not report default exceptions: underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report _test', function() {
            expect(checker.checkString('var a = _test;')).to.have.no.errors();
        });

        it('should not report test_', function() {
            expect(checker.checkString('var a = test_;')).to.have.no.errors();
        });

        it('should not report _test_', function() {
            expect(checker.checkString('var a = _test_;')).to.have.no.errors();
        });

        it('should not report test__', function() {
            expect(checker.checkString('var a = __test;')).to.have.no.errors();
        });

        it('should report dangling underscore identifier that is not included in the array', function() {
            expect(checker.checkString('var a = _notIncluded;'))
              .to.have.one.validation.error.from('disallowDanglingUnderscores');
        });
    });
});
