var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

var funcX = 'function x() {"use strict";\nreturn true;}';
var funcY = 'function x() {return true;}';

function makeChecker(rules) {
    rules = rules || { requireUseStrict: true };
    var checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(rules);
    return checker;
}

describe('rules/require-use-strict', function() {
    it('should report if use strict is not present', function() {
        var checker = makeChecker();
        expect(checker.checkString('var a = 2;'))
          .to.have.one.validation.error.from('requireUseStrict');
    });

    it('should report if rule is not used', function() {
        var checker = makeChecker({});
        expect(checker.checkString('var a = 2;'))
          .to.have.no.errors();
    });

    it('should report if use strict is not present, with func', function() {
        var checker = makeChecker();
        expect(checker.checkString('var a = 2;' + funcX))
          .to.have.one.validation.error.from('requireUseStrict');
    });

    it('should not report if use strict is present, with funcX', function() {
        var checker = makeChecker();
        expect(checker.checkString('\'use strict\';var a = 2;' + funcX))
          .to.have.no.errors();
    });

    it('should not report if use strict is present, with funcY', function() {
        var checker = makeChecker();
        expect(checker.checkString('\'use strict\';var a = 2;' + funcY))
          .to.have.no.errors();
    });

    it('should not report if \'use strict\' is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('\'use strict\';var a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if \'use strict\' is present with comment line', function() {
        var checker = makeChecker();
        expect(checker.checkString('// test\n\'use strict\';var a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if \'use strict\' is present with comment block', function() {
        var checker = makeChecker();
        expect(checker.checkString('/*\ntest */\n\'use strict\';var a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if "use strict" is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('"use strict";var a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if "use strict"\\s is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('"use strict"; var a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if "use strict"\\n is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('"use strict";\nvar a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if "use strict"\\n\\n is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('"use strict";\n\nvar a = 2;'))
          .to.have.no.errors();
    });

    it('should not report if "use strict"\\n\\t is present', function() {
        var checker = makeChecker();
        expect(checker.checkString('"use strict";\n\tvar a = 2;'))
          .to.have.no.errors();
    });
});
