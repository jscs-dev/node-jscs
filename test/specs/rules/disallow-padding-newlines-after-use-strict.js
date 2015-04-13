var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-padding-newlines-after-use-strict', function() {
    var rules = { disallowPaddingNewLinesAfterUseStrict: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    it('should not report if use strict is not present', function() {
        assert(checker.checkString('var a = 2;').isEmpty());
    });

    reportAndFix({
        name: 'with blank line',
        rules: rules,
        input: '"use strict";\n\nvar a = 2;',
        output: '"use strict";\nvar a = 2;'
    });

    it('should not report when followed by comment without blank line', function() {
        assert(checker.checkString('"use strict";\n// comment\nvar a = 2;').isEmpty());
    });

    it('should report when followed by comment with blank line', function() {
        assert(checker.checkString('"use strict";\n\n// comment\nvar a = 2;').getErrorCount() === 1);
    });

    it('should not report with no blank line', function() {
        assert(checker.checkString('"use strict";\nvar a = 2;').isEmpty());
    });

    it('should not report on same line', function() {
        assert(checker.checkString('"use strict"; var a = 2;').isEmpty());
    });

    it('should not report other statements', function() {
        assert(checker.checkString('"use stricts";\n\nvar a = 2;').isEmpty());
        assert(checker.checkString('2 + 2;\n\nvar a = 2;').isEmpty());
    });
});
