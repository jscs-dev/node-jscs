var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-mixed-spaces-and-tabs', function() {
    var checker;
    var multilineNotDocBlock = '\n\t/*\n\t * comment\n\t */';
    var docblock = '\n\t/**\n\t * comment\n\t */';
    var docblockWithMixed = '\n\t/**\n\t * comment \t \t\n\t */';

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowMixedSpacesAndTabs: true });
        });

        it('should report spaces before tabs', function() {
            assert(checker.checkString('    \tvar x;').getErrorCount() === 1);
        });

        it('should report tabs before spaces', function() {
            assert(checker.checkString('\t     var x;').getErrorCount() === 1);
        });

        it('should report spaces before tabs before spaces', function() {
            assert(checker.checkString('    \t    var x;').getErrorCount() === 1);
        });

        it('should report tabs before spaces before tabs', function() {
            assert(checker.checkString('\t     \tvar x;').getErrorCount() === 1);
        });

        it('should report spaces before tabs after content', function() {
            assert(checker.checkString('var x;    \t').getErrorCount() === 1);
        });

        it('should report tabs before spaces after content', function() {
            assert(checker.checkString('var x;\t     ').getErrorCount() === 1);
        });

        it('should report spaces before tabs before space after content', function() {
            assert(checker.checkString('var x;    \t    ').getErrorCount() === 1);
        });

        it('should report tabs before spaces before tabs after content', function() {
            assert(checker.checkString('var x;\t     \t').getErrorCount() === 1);
        });

        it('should report tabs with spaces with multiline comment in between', function() {
            assert(checker.checkString('\t/**/ \tvar x;').getErrorCount() === 1);
        });

        it('should report tabs before single space to align non-docblock multiline', function() {
            assert(checker.checkString('var x;' + multilineNotDocBlock).isEmpty());
        });

        it('should not report tabs before single space to align docblock', function() {
            assert(checker.checkString('var x;' + docblock).isEmpty());
        });

        it('should not report tabs after spaces after star in a docblock', function() {
            assert(checker.checkString('var x;' + docblockWithMixed).isEmpty());
        });

        it('should not report commented out code', function() {
            assert(checker.checkString('//\t    var x;').isEmpty());
        });

        it('should not report tabs only', function() {
            assert(checker.checkString('\t\tvar x;').isEmpty());
        });

        it('should not report tabs only with multiline comment in between', function() {
            assert(checker.checkString('\t/**/\tvar x;').isEmpty());
        });

        it('should not report spaces only', function() {
            assert(checker.checkString('    var x;').isEmpty());
        });
    });

    describe('option value "smart"', function() {
        beforeEach(function() {
            checker.configure({ disallowMixedSpacesAndTabs: 'smart' });
        });

        it('should report spaces before tabs', function() {
            assert(checker.checkString('    \tvar x;').getErrorCount() === 1);
        });

        it('should not report tabs before spaces', function() {
            assert(checker.checkString('\t     var x;').isEmpty());
        });

        it('should report spaces before tabs before spaces', function() {
            assert(checker.checkString('    \t    var x;').getErrorCount() === 1);
        });

        it('should report tabs before spaces before tabs', function() {
            assert(checker.checkString('\t     \tvar x;').getErrorCount() === 1);
        });

        it('should report spaces before tabs after content', function() {
            assert(checker.checkString('var x;    \t').getErrorCount() === 1);
        });

        it('should report tabs before spaces after content', function() {
            assert(checker.checkString('var x;\t     ').isEmpty());
        });

        it('should report spaces before tabs before space after content', function() {
            assert(checker.checkString('var x;    \t    ').getErrorCount() === 1);
        });

        it('should report tabs before spaces before tabs after content', function() {
            assert(checker.checkString('var x;\t     \t').getErrorCount() === 1);
        });

        it('should not report tabs before single space to align docblock', function() {
            assert(checker.checkString('var x;' + docblock).isEmpty());
        });

        it('should not report tabs after spaces after star in a docblock', function() {
            assert(checker.checkString('var x;' + docblockWithMixed).isEmpty());
        });

        it('should not report commented out code', function() {
            assert(checker.checkString('//\t    var x;').isEmpty());
        });

        it('should not report tabs only', function() {
            assert(checker.checkString('\t\tvar x;').isEmpty());
        });

        it('should not report spaces only', function() {
            assert(checker.checkString('    var x;').isEmpty());
        });
    });
});
