var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-dictionary-words', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ requireDictionaryWords: true });
        });

        it('should report non-words', function() {
            assert(checker.checkString('asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('var asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('let asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('const asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('function routine(jkl) {var asdf = 1;}').getErrorCount() === 2);
            assert(checker.checkString('routine(asdf)').getErrorCount() === 1);
            assert(checker.checkString('if(asdf){}').getErrorCount() === 1);
            assert(checker.checkString('for(asdf = 0; asdf<1; asdf++){asdf;}').getErrorCount() === 4);
            assert(checker.checkString('object[jkl] = 1;').getErrorCount() === 1);
            assert(checker.checkString('object["jkl"] = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.jkl = 1;').getErrorCount() === 1);

            assert(checker.checkString('JKL = 1;').getErrorCount() === 1);
        });

        it('should report multiple non-words', function() {
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfASDF = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfASDFAsdf = 1;').getErrorCount() === 3);
            assert(checker.checkString('asdf_asdf = 1;').getErrorCount() === 2);
        });

        it('should not report real words', function() {
            assert(checker.checkString('good = 1;').isEmpty());
            assert(checker.checkString('var good = 1;').isEmpty());
            assert(checker.checkString('let good = 1;').isEmpty());
            assert(checker.checkString('const good = 1;').isEmpty());
            assert(checker.checkString('function routine(fine) {var good = 1;}').isEmpty());
            assert(checker.checkString('routine(good)').isEmpty());
            assert(checker.checkString('if(good){}').isEmpty());
            assert(checker.checkString('for(good = 0; good < 1; good++){good;}').isEmpty());
            assert(checker.checkString('object[good] = 1;').isEmpty());
            assert(checker.checkString('object["good"] = 1;').isEmpty());
            assert(checker.checkString('object.good = 1;').isEmpty());
        });

        it('should not report multiple real words', function() {
            assert(checker.checkString('goodGood = 1;').isEmpty());
            assert(checker.checkString('goodGOOD = 1;').isEmpty());
            assert(checker.checkString('goodGOODGood = 1;').isEmpty());
            assert(checker.checkString('good_good = 1;').isEmpty());
        });
    });

    describe('includedForIdentifiersAndProperties', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    includedForIdentifiersAndProperties: [
                        'asdf',
                        'jkl'
                    ]
                }
            });
        });

        it('should not report included words', function() {
            assert(checker.checkString('asdf = 1;').isEmpty());
            assert(checker.checkString('object[jkl] = 1;').isEmpty());
            assert(checker.checkString('object["jkl"] = 1;').isEmpty());
            assert(checker.checkString('object.jkl = 1;').isEmpty());
        });
    });

    describe('includedForProperties', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    includedForProperties: [
                        'asdf',
                        'jkl'
                    ]
                }
            });
        });

        it('should report non-words', function() {
            assert(checker.checkString('asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('object[jkl] = 1;').getErrorCount() === 1);
        });

        it('should not report included words', function() {
            assert(checker.checkString('object["jkl"] = 1;').isEmpty());
            assert(checker.checkString('object.jkl = 1;').isEmpty());
        });
    });

    describe('excluded', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    excluded: [
                        'good'
                    ]
                }
            });
        });

        it('should report excluded words', function() {
            assert(checker.checkString('good = 1;').getErrorCount() === 1);
            assert(checker.checkString('object[good] = 1;').getErrorCount() === 1);
            assert(checker.checkString('object["good"] = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.good = 1;').getErrorCount() === 1);
        });
    });

    describe('exceptions', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: true
            });
        });

        it('should not report non-words from the standard APIs', function() {
            assert(checker.checkString('"foo".substr();').isEmpty());
            assert(checker.checkString('[].unshift();').isEmpty());
            assert(checker.checkString('new DataView().getUint32();').isEmpty());
            assert(checker.checkString('Date.UTC();').isEmpty());
            assert(checker.checkString('JSON.stringify();').isEmpty());
            assert(checker.checkString('Math.abs();').isEmpty());
            assert(checker.checkString('Number.parseInt();').isEmpty());
            assert(checker.checkString('({}).__proto__();').isEmpty());
            assert(checker.checkString('new RegExp();').isEmpty());
            assert(checker.checkString('/regexp/.exec();').isEmpty());
            assert(checker.checkString('eval();').isEmpty());
            assert(checker.checkString('isNaN();').isEmpty());
        });
    });
});
