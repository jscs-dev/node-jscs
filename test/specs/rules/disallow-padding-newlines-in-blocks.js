var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-in-blocks', function() {
    var checker;
    var trueConfig = [
      true,
      { open: true, close: true }
    ];

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    trueConfig.forEach(function(config) {
        describe(config, function() {
            beforeEach(function() {
                checker.configure({ disallowPaddingNewlinesInBlocks: config });
            });

            it('should not report missing newline after opening brace', function() {
                assert(checker.checkString('if (true) {abc();\n}').isEmpty());
            });

            it('should not report missing newline before closing brace', function() {
                assert(checker.checkString('if (true) {\nabc();}').isEmpty());
            });

            it('should report extra padding newline after opening brace', function() {
                assert(checker.checkString('if (true) {\n\nabc();\n}').getErrorCount() === 1);
            });

            it('should report extra padding newline before closing brace', function() {
                assert(checker.checkString('if (true) {\nabc();\n\n}').getErrorCount() === 1);
            });

            it('should report extra padding newlines in both cases', function() {
                assert(checker.checkString('if (true) {\n\nabc();\n\n}').getErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                assert(checker.checkString('if (true) {\nabc();\n}').isEmpty());
            });

            it('should not report with no spaces in allman style', function() {
                assert(checker.checkString('if (true)\n{\nabc();\n}').isEmpty());
            });

            it('should not report with comment on first line', function() {
                assert(checker.checkString('if (true) {\n//comment\nabc();\n}').isEmpty());
            });

            it('should not report with multi-line comment on first line', function() {
                assert(checker.checkString('if (true) {\n/*\ncomment\n*/\nabc();\n}').isEmpty());
            });

            it('should not report single line empty function definitions', function() {
                assert(checker.checkString('var a = function() {};').isEmpty());
            });

            it('should not report multiline empty function definitions', function() {
                assert(checker.checkString('var a = function() {\n};').isEmpty());
            });

            it('should report extra padding newline followed by comments', function() {
                assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n}').getErrorCount() === 1);
            });

            it('should report extra padding newline preceded by comments', function() {
                assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n\n}').getErrorCount() === 1);
            });

            it('should report extra padding newlines in both cases with comments', function() {
                assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n\n}').getErrorCount() === 2);
            });

            it('should not report leading nor trailing comments', function() {
                assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n}').isEmpty());
            });

            it('should report padding newline even when there is newline after block', function() {
                assert(checker.checkString('if (true) {\n\nvar x = 5;\n}\n\nif (true) {}').getErrorCount() === 1);
            });
        });
    });

    describe('open: true, close: false', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { open: true, close: false } });
        });

        it('should not report extra padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n}').isEmpty());
        });

        it('should report extra padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n}').getErrorCount() === 1);
        });
    });

    describe('open: false, close: true', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { open: false, close: true } });
        });

        it('should report extra padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n}').getErrorCount() === 1);
        });

        it('should not report extra padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n}').isEmpty());
        });
    });

    describe('allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { allExcept: ['conditionals'] } });
        });

        it('should not report extra padding newline after opening brace of if statement', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n}').isEmpty());
        });

        it('should not report extra padding newline before closing brace of if statement', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n}').isEmpty());
        });

        it('should not report extra padding newline after opening brace of else statement', function() {
            assert(checker.checkString('if (true) {} else {\n\nabc();\n}').isEmpty());
        });

        it('should not report extra padding newline before closing brace of else statement', function() {
            assert(checker.checkString('if (true) {} else {\nabc();\n\n}').isEmpty());
        });

        it('should report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').getErrorCount() === 1);
        });

        it('should report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').getErrorCount() === 1);
        });

        it('should report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').getErrorCount() === 1);
        });

        it('should report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').getErrorCount() === 1);
        });
    });

    describe('allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { allExcept: ['functions'] } });
        });

        it('should not report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').isEmpty());
        });

        it('should report extra padding newline after opening brace of conditional', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n};').getErrorCount() === 1);
        });

        it('should report extra padding newline before closing brace of conditional', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n};').getErrorCount() === 1);
        });
    });

    describe('open: true, close: false, allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: {
              open: true,
              close: false,
              allExcept: ['functions'] }
            });
        });

        it('should not report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').isEmpty());
        });

        it('should report extra padding newline after opening brace of conditional', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n};').getErrorCount() === 1);
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n};').isEmpty());
        });
    });

    describe('open: false, close: true, allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: {
              open: false,
              close: true,
              allExcept: ['functions'] }
            });
        });

        it('should not report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n};').isEmpty());
        });

        it('should report extra padding newline before closing brace of conditional', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n};').getErrorCount() === 1);
        });
    });

    describe('open: true, close: false, allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: {
              open: true,
              close: false,
              allExcept: ['conditionals'] }
            });
        });

        it('should report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').getErrorCount() === 1);
        });

        it('should report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').getErrorCount() === 1);
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').isEmpty());
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n};').isEmpty());
        });
    });

    describe('open: false, close: true, allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: {
              open: false,
              close: true,
              allExcept: ['conditionals'] }
            });
        });

        it('should not report extra padding newline after opening brace of function declaration', function() {
            assert(checker.checkString('function foo() {\n\nreturn bar;}').isEmpty());
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            assert(checker.checkString('var foo = function() {\n\nreturn bar;}').isEmpty());
        });

        it('should report extra padding newline before closing brace of function declaration', function() {
            assert(checker.checkString('function foo() {return bar;\n\n};').getErrorCount() === 1);
        });

        it('should report extra padding newline before closing brace of function expression', function() {
            assert(checker.checkString('var foo = function() {return bar;\n\n};').getErrorCount() === 1);
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n};').isEmpty());
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n};').isEmpty());
        });
    });
});
