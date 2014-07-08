var Checker = require('../lib/checker');
var assert = require('assert');

describe('modules/string-checker', function() {
    describe('line srating with hash, temporary, until we will have inline rules', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should ignore lines starting with #!', function() {
            assert(checker.checkString(
                '#! random stuff\n' +
                '#! 1234\n' +
                'var a = 5;\n'
            ).isEmpty());
        });
        it('should ignore ios instruments style import', function() {
            assert(checker.checkString(
                '#import "abc.js"\n' +
                '#import abc.js\n' +
                'var a = 5;\n'
            ).isEmpty());
        });
        it('should not replace when not beginning of line', function() {
            checker.configure({ disallowMultipleLineStrings: true });
            assert(checker.checkString(
                '#import "abc.js"\n' +
                'var b="#import \\\n abc.js";\n' +
                'var a = 5;\n'
            ).getErrorCount() === 1);
        });
    });

    it('should not process the rule if it is equals to null (#203)', function() {
        var checker = new Checker();
        checker.registerDefaultRules();

        try {
            checker.configure({
                preset: 'jquery',
                requireCurlyBraces: null
            });
            assert(true);
        } catch (_) {
            assert(false);
        }
    });
    it('should throw if preset does not exist', function() {
        var checker = new Checker();

        checker.registerDefaultRules();

        try {
            checker.configure({
                preset: 'not-exist'
            });

            assert(false);
        } catch (e) {
            assert(e.toString() === 'Error: Preset "not-exist" does not exist');
        }
    });

    describe('rules registration', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });
        it('should report rules in config which don\'t match any registered rules', function() {
            var error;
            try {
                checker.configure({ disallowMulipleLineBreaks: true, disallowMultipleVarDelc: true });
            } catch (e) {
                error = e;
            }
            assert.equal(
                error.message,
                'Unsupported rules: disallowMulipleLineBreaks, disallowMultipleVarDelc'
            );
        });
        it('should not report rules in config which match registered rules', function() {
            var error;
            try {
                checker.configure({ disallowMultipleLineBreaks: true, disallowMultipleVarDecl: true });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });
        it('should not report "excludeFiles" rule as unregistered', function() {
            var error;
            try {
                checker.configure({ excludeFiles: [] });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });
    });

    describe('formatString', function() {
        it('requireCurlyBraces', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireCurlyBraces: ['while', 'do']
            });
            assert(checker.checkString(
                checker.formatString(   'while(i<l) \ni++;\n' +
                                        'do\ni++;\nwhile (i<l);' +
                                        'try {\n i++;}\ncatch(e)\n{ e=e;}')
            ).isEmpty());
        });
        it('requireSpaceAfterKeywords', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceAfterKeywords: ['if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch']
            });
            assert(checker.checkString(
                checker.formatString(   'if(i<l){\n i++;\n}else{\n i--;\n}')
            ).isEmpty());
        });
        it('requireSpacesInFunctionExpression', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpacesInFunctionExpression: {beforeOpeningCurlyBrace: true}
            });
            assert(checker.checkString(
                checker.formatString('function test(){}')
            ).isEmpty());
        });
        it('requirePaddingNewlinesInBlocks', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requirePaddingNewlinesInBlocks: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){i++;}')
            ).isEmpty());
        });
        it('requireSpacesInsideObjectBrackets', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpacesInsideObjectBrackets: 'all'
            });
            assert(checker.checkString(
                checker.formatString('var a={a:1,b:2};')
            ).isEmpty());
        });
        it('requireSpacesInsideArrayBrackets', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpacesInsideArrayBrackets: 'allButNested'
            });
            assert(checker.checkString(
                checker.formatString('var a=[1,2,3];')
            ).isEmpty());
        });
        it('requireSpaceBeforeBlockStatements', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceBeforeBlockStatements: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){i++;}')
            ).isEmpty());
        });
        it('requireLineFeedAtFileEnd', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireLineFeedAtFileEnd: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){i++;}')
            ).isEmpty());
        });
        it('validateLineBreaks', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                validateLineBreaks: 'LF'
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){\ri++;\r}\r')
            ).isEmpty());
        });
        it('validateIndentation', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                validateIndentation: '\t'
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){\ni++;\nif(i<l){\ni++;\n}\n }\n')
            ).isEmpty());
        });
        it('requireSpaceAfterPrefixUnaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceAfterPrefixUnaryOperators: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){++i;if(i<l){+i;}}')
            ).isEmpty());
        });

        it('requireSpaceBeforePostfixUnaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceBeforePostfixUnaryOperators: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){i++;if(i<l){i--;}}')
            ).isEmpty());
        });

        it('requireSpaceBeforeBinaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceBeforeBinaryOperators: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){l=l+i;if(i<l){l+=i;}}')
            ).isEmpty());
        });

        it('requireSpaceAfterBinaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpaceAfterBinaryOperators: true
            });
            assert(checker.checkString(
                checker.formatString('if(i<l){l=l+i;if(i<l){l+=i;}}')
            ).isEmpty());
        });

        it('disallowSpaceBeforeBinaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                disallowSpaceBeforeBinaryOperators: [',']
            });
            assert(checker.checkString(
                checker.formatString('var a=[1 ,2  ,3]; ')
            ).isEmpty());
        });

        it('disallowSpaceBeforeBinaryOperators', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireSpacesInConditionalExpression: {afterTest: true, beforeConsequent: true, afterConsequent: true, beforeAlternate: true}
            });
            assert(checker.checkString(
                checker.formatString('var a=a?b:c; ')
            ).isEmpty());
        });

    });
});
