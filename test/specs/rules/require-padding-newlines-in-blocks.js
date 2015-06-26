var Checker = require('../../../lib/checker');
var assert = require('assert');

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
            assert.throws(function() {
                checker.configure({ requirePaddingNewlinesInBlocks: 'string' });
            });
        });

        describe('option is boolean', function() {
            it('should report configuration error if false', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: false });
                });
            });
        });

        describe('option is object', function() {
            it('should report configuration error if options.open is not found', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'close': true } });
                });
            });

            it('should report configuration error if options.open is not a boolean', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': 'true', 'close': true } });
                });
            });

            it('should report configuration error if options.close is not found', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': true } });
                });
            });

            it('should report configuration error if options.close is not a boolean', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { 'open': true, 'close': 'true' } });
                });
            });

            it('should report configuration error if both options.open and options.close are false', function() {
                assert.throws(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: { open: false, close: false} });
                });
            });
        });
    });

    scenarios.forEach(function(scenario) {
        describe('valid option: ' + JSON.stringify(scenario.option), function() {
            it('should not report configuration error', function() {
                assert.doesNotThrow(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });
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
                    assert(checker.
                        checkString('if (true) {' + scenario.statement + '\n\n}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline', function() {
                    assert(checker.
                        checkString('if (true) {\n' + scenario.statement + '\n\n}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for with no linebreak and no padding newline before ' +
                    'single line comments', function() {
                    assert(checker.
                        checkString('if (true) {//bla\n' + scenario.statement + '\n\n}').
                            getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline before single line ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {\n//bla\n' + scenario.statement + '\n\n}').
                            getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for no linebreak and no padding newline before mulitiline ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {/**/\n' + scenario.statement + '\n\n}').
                            getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline before mulitiline ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {\n/**/\n' + scenario.statement + '\n\n}').
                            getErrorCount() === errorCount);
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
                    assert(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for with linebreak but no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '\n}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline after single line ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n//bla\n}').
                            getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for no linebreak and no padding newline after mulitiline ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error for linebreak but no padding newline after mulitiline ' +
                    'comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/\n}').
                            getErrorCount() === errorCount);
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
                    assert(checker
                        .checkString('if (true) {' + scenario.statement + '}').getErrorCount() === errorCount);
                });

                it('should report ' + errorCount + ' error(s) for linebreak but no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {\n' + scenario.statement + '\n}').getErrorCount() === errorCount);
                });
            });

            describe('tests for valid padding newlines after opening brace and before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should not report error for single padding newline on both sides', function() {
                    assert(checker.checkString('if (true) {\n\n' + scenario.statement + '\n\n}').isEmpty());
                });

                it('should not report error for double padding newline after opening brace and single padding ' +
                    'newline before closing brace', function() {
                    assert(checker.checkString('if (true) {\n\n\n' + scenario.statement + '\n\n}').isEmpty());
                });

                it('should not report error for single padding newline after opening brace and double padding  ' +
                    'newline before closing brace', function() {
                    assert(checker.checkString('if (true) {\n\n' + scenario.statement + '\n\n\n}').isEmpty());
                });

                it('should not report error for single padding newline on both sides with comments', function() {
                    assert(checker.checkString('if (true) {\n\n//bla\n' + scenario.statement + '\n\n}').isEmpty());
                });
            });

            describe('tests for special valid rule exceptions', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should not report empty function definitions', function() {
                    assert(checker.checkString('var a = function() {};').isEmpty());
                });

                if (typeof scenario.option === 'number' && scenario.option === 1) {
                    it('should not report single statement functions', function() {
                        assert(checker.checkString('var a = function() {abc();};').isEmpty());
                    });
                }
            });

            describe('tests for fixString', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should fix missing padding newlines', function() {
                    if (typeof scenario.option === 'object' && scenario.option.open === false) {
                        assert.equal(
                            checker.fixString('if (true) {' + scenario.statement + '}').output,
                            'if (true) {' + scenario.statement + '\n\n}'
                        );
                    } else if (typeof scenario.option === 'object' && scenario.option.close === false) {
                        assert.equal(
                            checker.fixString('if (true) {' + scenario.statement + '}').output,
                            'if (true) {\n\n' + scenario.statement + '}'
                        );
                    } else {
                        assert.equal(
                            checker.fixString('if (true) {' + scenario.statement + '}').output,
                            'if (true) {\n\n' + scenario.statement + '\n\n}'
                        );
                    }
                });
            });
        });
    });
});
