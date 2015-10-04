var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-multiple-line-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultipleLineStrings: true });
    });

    it('should report multiple line strings', function() {
        expect(checker.checkString('x = " \\\n oops";'))
          .to.have.one.validation.error.from('disallowMultipleLineStrings');
    });

    it('should not fix multiple line strings', function() {
        var input = 'x = " \\\n oops";';
        var result = checker.fixString(input);
        expect(result.output).to.equal(input);
        expect(result.errors).to.have.one.validation.error.from('disallowMultipleLineStrings');
    });

    it('should not report concatenated strings on multiple lines', function() {
        expect(checker.checkString('x = " " + \n " ok";')).to.have.no.errors();
    });

    it('should not report single line strings', function() {
        expect(checker.checkString('x = "ok"')).to.have.no.errors();
    });
});
