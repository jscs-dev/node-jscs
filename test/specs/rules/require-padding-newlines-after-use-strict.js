var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe.skip('rules/require-padding-newlines-after-use-strict', function() {
    var rules = { requirePaddingNewLinesAfterUseStrict: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    it('should not report if use strict is not present', function() {
        expect(checker.checkString('var a = 2;')).to.have.no.errors();
    });

    reportAndFix({
        name: 'with no blank line',
        rules: rules,
        input: '"use strict";\nvar a = 2;',
        output: '"use strict";\n\nvar a = 2;'
    });

    it('should report when followed by comment without blank line', function() {
        expect(checker.checkString('"use strict";\n// comment\nvar a = 2;'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report when followed by comment with blank line', function() {
        expect(checker.checkString('"use strict";\n\n// comment\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report with blank line', function() {
        expect(checker.checkString('"use strict";\n\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report with extra blank lines', function() {
        expect(checker.checkString('"use strict";\n\n\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report other statements', function() {
        expect(checker.checkString('"use stricts";\nvar a = 2;')).to.have.no.errors();
        expect(checker.checkString('2 + 2;\nvar a = 2;')).to.have.no.errors();
    });
});
