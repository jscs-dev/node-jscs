var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-in-files', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report no padding new lines at file start and end', function() {
        checker.configure({ requirePaddingNewlinesInFiles: true });
        assert(checker.checkString('var x;\n').getErrorCount() === 2);
    });

    it('should not report padding new lines at file start and end', function() {
        checker.configure({ requirePaddingNewlinesInFiles: true });
        assert(checker.checkString('\nvar x;\n\n').isEmpty());
    });

    it('should report no padding new line at file start', function() {
        checker.configure({ requirePaddingNewlinesInFiles: 'beginningOfFileOnly' });
        assert(checker.checkString('var x;').getErrorCount() === 1);
        assert(checker.checkString('var x;\n').getErrorCount() === 1);
        assert(checker.checkString('var x;\n\n').getErrorCount() === 1);
    });

    it('should not report padding new line at file start', function() {
        checker.configure({ requirePaddingNewlinesInFiles: 'beginningOfFileOnly' });
        assert(checker.checkString('\nvar x;').isEmpty());
        assert(checker.checkString('\nvar x;\n').isEmpty());
        assert(checker.checkString('\nvar x;\n\n').isEmpty());
    });

    it('should report no padding new line at file end', function() {
        checker.configure({ requirePaddingNewlinesInFiles: 'endOfFileOnly' });
        assert(checker.checkString('var x;\n').getErrorCount() === 1);
        assert(checker.checkString('\nvar x;\n').getErrorCount() === 1);
    });

    it('should not report padding new line at file end', function() {
        checker.configure({ requirePaddingNewlinesInFiles: 'endOfFileOnly' });
        assert(checker.checkString('var x;\n\n').isEmpty());
        assert(checker.checkString('\nvar x;\n\n').isEmpty());
    });
});
