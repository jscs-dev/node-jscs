var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-after-use-strict', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesAfterUseStrict: true });
    });

    it('should not report if use strict is not present', function() {
        assert(checker.checkString('var a = 2;').isEmpty());
    });

    describe('with blank line', function() {
        var input;
        var output;

        beforeEach(function() {
            input = '"use strict";\n\nvar a = 2;';
            output = '"use strict";\nvar a = 2;';
        });

        it('should report', function() {
            assert(checker.checkString(input).getErrorCount() === 1);
        });

        it('should fix', function() {
            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, output);
        });
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
