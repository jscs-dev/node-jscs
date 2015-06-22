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
        { option: 1, statement: 'abc();abc();' }
    ];

    describe('invalid options', function() {
        it('should report configuration error if not boolean or integer', function() {
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

                it('should report error for no linebreak and no padding newline', function() {
                    assert(checker.
                        checkString('if (true) {' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });

                it('should report error for linebreak but no padding newline', function() {
                    assert(checker.
                        checkString('if (true) {\n' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });

                it('should report error for with no linebreak and no padding newline before single line comments',
                    function() {
                    assert(checker.
                        checkString('if (true) {//bla\n' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });

                it('should report error for linebreak but no padding newline before single line comments', function() {
                    assert(checker.
                        checkString('if (true) {\n//bla\n' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });

                it('should report error for no linebreak and no padding newline before mulitiline comments',
                    function() {
                    assert(checker.
                        checkString('if (true) {/**/\n' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });

                it('should report error for linebreak but no padding newline before mulitiline comments', function() {
                    assert(checker.
                        checkString('if (true) {\n/**/\n' + scenario.statement + '\n\n}').getErrorCount() === 1);
                });
            });

            describe('tests for missing padding newline before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should report error for no linebreak and no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '}').getErrorCount() === 1);
                });

                it('should report error for with linebreak but no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '\n}').getErrorCount() === 1);
                });

                it('should report error for no linebreak and no padding newline after single line comments',
                    function() {
                    assert(checker
                        .checkString('if (true) {\n\n' + scenario.statement + '\n//bla}').getErrorCount() === 1);
                });

                it('should report error for linebreak but no padding newline after single line comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n//bla\n}').getErrorCount() === 1);
                });

                it('should report error for no linebreak and no padding newline after mulitiline comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/}').getErrorCount() === 1);
                });

                it('should report error for linebreak but no padding newline after mulitiline comments', function() {
                    assert(checker.
                        checkString('if (true) {\n\n' + scenario.statement + '\n/**/\n}').getErrorCount() === 1);
                });
            });

            describe('tests for missing padding newlines both after open brace and before closing brace', function() {
                beforeEach(function() {
                    checker.configure({ requirePaddingNewlinesInBlocks: scenario.option });
                });

                it('should report 2 errors for no linebreak and no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {' + scenario.statement + '}').getErrorCount() === 2);
                });

                it('should report 2 errors for linebreak but no padding newline', function() {
                    assert(checker
                        .checkString('if (true) {\n' + scenario.statement + '\n}').getErrorCount() === 2);
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
                    assert.equal(
                        checker.fixString('if (true) {abc();abc();}').output,
                        'if (true) {\n\nabc();abc();\n\n}'
                    );
                });
            });
        });
    });
});
