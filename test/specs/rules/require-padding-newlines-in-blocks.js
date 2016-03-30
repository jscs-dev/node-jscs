var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-padding-newlines-in-blocks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    var scenarios = [
        { option: true, statement: 'abc();' },
        { option: 1, statement: 'abc();abc();' },
        { option: { 'open': true, 'close': true }, statement: 'abc();' },
        { option: { 'open': false, 'close': true }, statement: 'abc();' },
        { option: { 'open': true, 'close': false }, statement: 'abc();' }
    ];

    describe('invalid options', function() {
        it('should report configuration error if not boolean, integer or object', function() {
            expect(function() {
                checker.configure({ requirePaddingNewlinesInBlocks: 'string' });
            }).to.throw();
        });

        describe('option is object', function() {
            it('should report configuration error if options.open is not found', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'close': true } });
                }).to.throw();
            });

            it('should report configuration error if options.open is not a boolean', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': 'true', 'close': true } });
                }).to.throw();
            });

            it('should report configuration error if options.close is not found', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': true } });
                }).to.throw();
            });

            it('should report configuration error if options.close is not a boolean', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': true, 'close': 'true' } });
                }).to.throw();
            });

            it('should report configuration error if both options.open and options.close are false', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { open: false, close: false} });
                }).to.throw();
            });
        });
    });

    scenarios.forEach(function(scenario) {
        describe('valid option: ' + JSON.stringify(scenario.option), function() {
            it('should not report configuration error', function() {
                expect(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                }).to.not.throw();
            });

            describe('tests for missing padding newline after opening brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                var errorCount = 1;
                if (typeof scenario.option === 'object') {
                    if (scenario.option.open === false) {
                        errorCount = 0;
                    }
                }

                it('should report ' + errorCount + ' error for no linebreak and no padding newline', function() {
                    expect(checker.
                        checkString('if (true) {' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline', function() {
                    expect(checker.
                        checkString('if (true) {\n' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for with no linebreak and no padding newline before ' +
                    'single line comments', function() {
                    expect(checker.
                        checkString('if (true) {//bla\n' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline before single line ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {\n//bla\n' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for no linebreak and no padding newline before mulitiline ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {/**/\n' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline before mulitiline ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {\n/**/\n' + scenario.statement + '\n\n}'))
                      .to.have.error.count.equal(errorCount);
                });
            });

            describe('tests for missing padding newline before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                var errorCount = 1;
                if (typeof scenario.option === 'object') {
                    if (scenario.option.close === false) {
                        errorCount = 0;
                    }
                }

                it('should report ' + errorCount + ' error for no linebreak and no padding newline', function() {
                    expect(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for with linebreak but no padding newline', function() {
                    expect(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline after single line ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n//bla\n}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for no linebreak and no padding newline after mulitiline ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline after mulitiline ' +
                    'comments', function() {
                    expect(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/\n}'))
                      .to.have.error.count.equal(errorCount);
                });
            });

            describe('tests for missing padding newlines both after open brace and before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                var errorCount = 2;
                if (typeof scenario.option === 'object') {
                    if (scenario.option.open === false) {
                        errorCount -= 1;
                    }

                    if (scenario.option.close === false) {
                        errorCount -= 1;
                    }
                }

                it('should report ' + errorCount + ' error(s) for no linebreak and no padding newline', function() {
                    expect(checker
                        .checkString('if (true) {' + scenario.statement + '}'))
                      .to.have.error.count.equal(errorCount);
                });

                it('should report ' + errorCount + ' error(s) for linebreak but no padding newline', function() {
                    expect(checker
                        .checkString('if (true) {\n' + scenario.statement + '\n}'))
                      .to.have.error.count.equal(errorCount);
                });
            });

            describe('tests for valid padding newlines after opening brace and before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should not report error for single padding newline on both sides', function() {
                    expect(checker.checkString('if (true) {\n\n' + scenario.statement + '\n\n}')).to.have.no.errors();
                });

                it('should not report error for double padding newline after opening brace and single padding ' +
                    'newline before closing brace', function() {
                    expect(checker.checkString('if (true) {\n\n\n' + scenario.statement + '\n\n}')).to.have.no.errors();
                });

                it('should not report error for single padding newline after opening brace and double padding  ' +
                    'newline before closing brace', function() {
                    expect(checker.checkString('if (true) {\n\n' + scenario.statement + '\n\n\n}')).to.have.no.errors();
                });

                it('should not report error for single padding newline on both sides with comments', function() {
                    expect(checker.checkString('if (true) {\n\n//bla\n' + scenario.statement + '\n\n}'))
                      .to.have.no.errors();
                });
            });

            describe('tests for special valid rule exceptions', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should not report empty function definitions', function() {
                    expect(checker.checkString('var a = function() {};')).to.have.no.errors();
                });

                if (typeof scenario.option === 'number' && scenario.option === 1) {
                    it('should not report single statement functions', function() {
                        expect(checker.checkString('var a = function() {abc();};')).to.have.no.errors();
                    });
                }
            });

            describe('tests for fixString', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should fix missing padding newlines', function() {
                    if (typeof scenario.option === 'object' && scenario.option.open === false) {
                        expect(checker.fixString('if (true) {' + scenario.statement + '}').output)
                          .to.equal('if (true) {' + scenario.statement + '\n\n}');
                    } else if (typeof scenario.option === 'object' && scenario.option.close === false) {
                        expect(checker.fixString('if (true) {' + scenario.statement + '}').output)
                          .to.equal('if (true) {\n\n' + scenario.statement + '}');
                    } else {
                        expect(checker.fixString('if (true) {' + scenario.statement + '}').output)
                          .to.equal('if (true) {\n\n' + scenario.statement + '\n\n}');
                    }
                });
            });
        });
    });

    describe('allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: { allExcept: ['conditionals'] } });
        });

        it('should not report missing extra padding newline after opening brace of if statement', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after closing brace of if statement', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of else statement', function() {
            expect(checker.checkString('if (true) {} else {\nabc();\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after closing brace of else statement', function() {
            expect(checker.checkString('if (true) {} else {\n\nabc();\n}')).to.have.no.errors();
        });

        it('should report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n}'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });
    });

    describe('allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: { allExcept: ['functions'] } });
        });

        it('should not report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should report missing extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

    });

    describe('open: true, close: false, allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: {
                open: true,
                close: false,
                allExcept: ['functions'] }
            });
        });

        it('should not report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should report missing extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should not report missing extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });
    });

    describe('open: false, close: true, allExcept: ["functions"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: {
                open: false,
                close: true,
                allExcept: ['functions'] }
            });
        });

        it('should not report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
        });

        it('should report missing extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });
    });

    describe('open: true, close: false, allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: {
                open: true,
                close: false,
                allExcept: ['conditionals'] }
            });
        });

        it('should report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should not report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });
    });

    describe('open: false, close: true, allExcept: ["conditionals"]', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: {
                open: false,
                close: true,
                allExcept: ['conditionals'] }
            });
        });

        it('should not report missing extra padding newline after opening brace of function declaration', function() {
            expect(checker.checkString('function foo() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should not report missing extra padding newline after opening brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\nreturn bar;\n\n}')).to.have.no.errors();
        });

        it('should report missing extra padding newline before closing brace of function declaration', function() {
            expect(checker.checkString('function foo() {\n\nreturn bar;\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should report missing extra padding newline before closing brace of function expression', function() {
            expect(checker.checkString('var foo = function() {\n\nreturn bar;\n};'))
              .to.have.one.validation.error.from('requirePaddingNewlinesInBlocks');
        });

        it('should not report missing extra padding newline after opening brace of conditional', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n};')).to.have.no.errors();
        });

        it('should not report missing extra padding newline before closing brace of conditional', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n};')).to.have.no.errors();
        });
    });
});
