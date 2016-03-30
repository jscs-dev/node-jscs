var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
                expect(checker.checkString('if (true) {abc();\n}')).to.have.no.errors();
            });

            it('should not report missing newline before closing brace', function() {
                expect(checker.checkString('if (true) {\nabc();}')).to.have.no.errors();
            });

            it('should report extra padding newline after opening brace', function() {
                expect(checker.checkString('if (true) {\n\nabc();\n}'))
                  .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
            });

            it('should report extra padding newline before closing brace', function() {
                expect(checker.checkString('if (true) {\nabc();\n\n}'))
                  .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
            });

            it('should report extra padding newlines in both cases', function() {
                expect(checker.checkString('if (true) {\n\nabc();\n\n}')).to.have.error.count.equal(2);
            });

            it('should not report with no spaces', function() {
                expect(checker.checkString('if (true) {\nabc();\n}')).to.have.no.errors();
            });

            it('should not report with no spaces in allman style', function() {
                expect(checker.checkString('if (true)\n{\nabc();\n}')).to.have.no.errors();
            });

            it('should not report with comment on first line', function() {
                expect(checker.checkString('if (true) {\n//comment\nabc();\n}')).to.have.no.errors();
            });

            it('should not report with multi-line comment on first line', function() {
                expect(checker.checkString('if (true) {\n/*\ncomment\n*/\nabc();\n}')).to.have.no.errors();
            });

            it('should not report single line empty function definitions', function() {
                expect(checker.checkString('var a = function() {};')).to.have.no.errors();
            });

            it('should not report multiline empty function definitions', function() {
                expect(checker.checkString('var a = function() {\n};')).to.have.no.errors();
            });

            it('should report extra padding newline followed by comments', function() {
                expect(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n}'))
                  .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
            });

            it('should report extra padding newline preceded by comments', function() {
                expect(checker.checkString('if (true) {\n//comment\n\n/* comments */\n\n}'))
                  .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
            });

            it('should report extra padding newlines in both cases with comments', function() {
                expect(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n\n}'))
                  .to.have.error.count.equal(2);
            });

            it('should not report leading nor trailing comments', function() {
                expect(checker.checkString('if (true) {\n//comment\n\n/* comments */\n}')).to.have.no.errors();
            });

            it('should report padding newline even when there is newline after block', function() {
                expect(checker.checkString('if (true) {\n\nvar x = 5;\n}\n\nif (true) {}'))
                  .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
            });
        });
    });

    describe('open: true, close: false', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { open: true, close: false } });
        });

        it('should not report extra padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n}')).to.have.no.errors();
        });

        it('should report extra padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });
    });

    describe('open: false, close: true', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { open: false, close: true } });
        });

        it('should report extra padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should not report extra padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n}')).to.have.no.errors();
        });
    });

    describe('allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { allExcept: ['conditionals'] } });
        });

        it('should not report extra padding newline after opening brace of if statement', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n}')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of if statement', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n}')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of else statement', function() {
            expect(checker.checkString('if (true) {} else {\n\nabc();\n}')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of else statement', function() {
            expect(checker.checkString('if (true) {} else {\nabc();\n\n}')).to.have.no.errors();
        });

        it('should report extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });
    });

    describe('allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewlinesInBlocks: { allExcept: ['functions'] } });
        });

        it('should not report extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should report extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
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
            expect(checker.checkString('function foo() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should report extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
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
            expect(checker.checkString('function foo() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });

        it('should report extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
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
            expect(checker.checkString('function foo() {\n\nreturn bar;}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should not report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
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
            expect(checker.checkString('function foo() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should not report extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;}')).to.have.no.errors();
        });

        it('should report extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {return bar;\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should report extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {return bar;\n\n};'))
              .to.have.one.validation.error.from('disallowPaddingNewlinesInBlocks');
        });

        it('should not report extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });

        it('should not report extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
        });
    });
});
