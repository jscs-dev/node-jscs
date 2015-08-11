var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-blocks-on-newline', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('configure', function() {
        it('should not report an error for value "true"', function() {
            assert.doesNotThrow(function() {
                checker.configure({ requireBlocksOnNewline: true });
            });
        });

        it('should not report an error for number value 1', function() {
            assert.doesNotThrow(function() {
                checker.configure({ requireBlocksOnNewline: 1 });
            });
        });

        it('should not report an error for object with property includeComments value true', function() {
            assert.doesNotThrow(function() {
                checker.configure({ requireBlocksOnNewline: {
                    includeComments: true
                }});
            });
        });

        it('should not report an error for object with property includeComments value true and minLines 1',
            function() {
                assert.doesNotThrow(function() {
                        checker.configure({ requireBlocksOnNewline: { includeComments: true, minLines: 1 } });
                    }
                );
            }
        );

        it('should report an error for value "false"', function() {
            assert.throws(function() {
                checker.configure({ requireBlocksOnNewline: false });
            });
        });

        it('should report an error for value "-1"', function() {
            assert.throws(function() {
                checker.configure({ requireBlocksOnNewline: -1 });
            });
        });

        it('should report error for object with property includeComments value false', function() {
            assert.throws(function() {
                checker.configure({ requireBlocksOnNewline: {
                    includeComments: false
                }});
            });
        });
    });

    it('should report an error for object with property includeComments value true ' +
        'and a non integer minLines value', function() {
            assert.throws(function() {
                    checker.configure({ requireBlocksOnNewline: { includeComments: true, minLines: true } });
                }
            );
        }
    );

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: true });
        });

        it('should report missing newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();\n}').getErrorCount() === 1);
        });
        it('should not report missing newline for comments after opening brace', function() {
            assert(checker.checkString('if (true) {//comments\n}').isEmpty());
        });
        it('should report missing newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();}').getErrorCount() === 1);
        });
        it('should not report missing newline for comments before closing brace', function() {
            assert(checker.checkString('if (true) {\n/*comments*/}').isEmpty());
        });
        it('should report missing newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\nabc();\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
        it('should not report missing newline for comments before block', function() {
            assert(checker.checkString('function a() {\n//comments\nif (true) {\nabc();\n}\n};').isEmpty());
        });
        it('should not report missing newline for comments after block', function() {
            assert(checker.checkString('function a() {\nif (true) {\nabc();\n}//comments\n};').isEmpty());
        });
    });

    describe('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: 1 });
        });

        it('should report missing newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();abc();\n}').getErrorCount() === 1);
        });
        it('should report missing newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();abc();}').getErrorCount() === 1);
        });
        it('should report missing newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();abc();}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\nabc();abc();\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
        it('should not report single statement functions', function() {
            assert(checker.checkString('var a = function() {abc();};').isEmpty());
        });
    });

    describe('option object includeComments true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: {
                includeComments: true
            }});
        });

        it('should report missing newline for comments after opening brace', function() {
            assert(checker.checkString('if (true) {//comments\n}').getErrorCount() === 1);
        });
        it('should report missing newline for comments before closing brace', function() {
            assert(checker.checkString('if (true) {\n/*comments*/}').getErrorCount() === 1);
        });
        it('should not report comments before empty function definitions', function() {
            assert(checker.checkString('if (true) {\n//comments\nvar a = function() {};\n}').isEmpty());
        });
    });
});
