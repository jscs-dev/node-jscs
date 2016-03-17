var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-var-decl-first', function() {
    describe('boolean', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        describe('configure', function() {
            it('should not report an error for value "true"', function() {
                expect(function() {
                    checker.configure({ requireVarDeclFirst: true });
                }).to.not.throw();
            });
        });

        describe('rule checks', function() {
            var testDeclStatements = function(checker, statement, expectedErrorCount) {
                var results;
                var resultCount;
                var errors;
                var count;

                checker.configure({ requireVarDeclFirst: true });
                results = checker.checkString(statement);
                resultCount = results.getErrorCount();
                errors = results.getErrorList();

                expect(resultCount).to.equal(expectedErrorCount);
                for (count = 0; count < resultCount; count++) {
                    expect(errors[count].message)
                        .to.equal('requireVarDeclFirst: Variable declarations ' +
                        'must be the first statements of a function scope.');
                }
            };

            describe('VariableDeclaration kinds #1783', function() {
                it('should not return errors for let', function() {
                    checker.checkString('let a;').isEmpty();
                });

                it('should not return errors for const', function() {
                    checker.checkString('const a;').isEmpty();
                });
            });

            describe('statements without spaces or linebreaks', function() {
                it('should not return errors for single var declaration at top of program scope', function() {
                    testDeclStatements(checker, 'var a;', 0);
                });

                it('should not return errors for single var declaration at top of program scope after prologue',
                    function() {
                    testDeclStatements(checker, '"use strict";var a;', 0);
                });

                it('should not return errors for single var declaration after single comment at top of program scope',
                    function() {
                    testDeclStatements(checker, '/*block comment*/var a;', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope',
                    function() {
                    testDeclStatements(checker, 'function a(){var b;}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after prologue', function() {
                    testDeclStatements(checker, 'function a(){"use strict";var b;}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after single comment', function() {
                    testDeclStatements(checker, 'function a(){/*block comment*/var b;}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'before and after single comments', function() {
                    testDeclStatements(checker, 'function a(){/*block comment*/var b;/*block comment*/}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after multiple comments', function() {
                    testDeclStatements(checker, 'function a(){/*block comment*//*block comment2*/var b;}', 0);
                });

                it('should not return errors for single var declaration at top of function expression scope',
                    function() {
                    testDeclStatements(checker, 'var a=function(){var b;}', 0);
                });

                it('should not return errors for single var declaration at top of function expression scope ' +
                    'after prologue', function() {
                    testDeclStatements(checker, 'var a=function(){"use strict";var b;}', 0);
                });

                it('should not return errors for multiple declarators in a var declaration at top of program scope',
                    function() {
                    testDeclStatements(checker, 'var a,b;', 0);
                });

                it('should not return errors for multiple var declaration at top of program scope', function() {
                    testDeclStatements(checker, 'var a, c;var b;', 0);
                });

                it('should not return errors for multiple var declaration sandwiching a single comment ' +
                    'at top of program scope', function() {
                    testDeclStatements(checker, 'var a, c;/*block comment*/var b;', 0);
                });

                it('should not return errors for multiple var declaration with a single comment before the ' +
                    'first var decl at top of program scope', function() {
                    testDeclStatements(checker, 'var a, d;/*block comment*/var b;/*block comment 2*/var c;', 0);
                });

                it('should not return errors for a single var declaration with comments sandwiched ' +
                    'between multiple declarators', function() {
                    testDeclStatements(checker,
                        'function tst(node){var array, /* array of class names */ncn = node.className;}', 0);
                });

                it('should return 1 error for single var declaration not at top of program scope', function() {
                    testDeclStatements(checker, 'if(0){}var b;', 1);
                });

                it('should return 1 error for single var declaration not at top of function declaration scope',
                    function() {
                    testDeclStatements(checker, 'var a; function b(){c=2;var d;}', 1);
                });

                it('should return 1 error for single var declaration not at top of program scope', function() {
                    testDeclStatements(checker, 'var a;a=1;var b;', 1);
                });

                it('should return 1 error for single var declaration that ' +
                    'occurs after a function declaration', function() {
                    testDeclStatements(checker, 'var a;function b(){var c;}var d;', 1);
                });

                it('should return 1 error for single var declaration not at top of function declaration scope',
                    function() {
                    testDeclStatements(checker, 'var a;function b(){var c;c=1;var d;}', 1);
                });

                it('should return 2 errors for 2 var declarations not at the top of program scope', function() {
                    testDeclStatements(checker, 'var a;a=1;var b;var c=1;', 2);
                });
            });

            describe('statements with spaces only', function() {
                it('should not return errors for single var declaration at top of program scope', function() {
                    testDeclStatements(checker, ' var a;', 0);
                });

                it('should not return errors for single var declaration at top of program scope after prologue',
                    function() {
                    testDeclStatements(checker, '"use strict"; var a;', 0);
                });

                it('should not return errors for single var declaration after single comment at top of ' +
                    'program scope', function() {
                    testDeclStatements(checker, '/*block comment*/ var a;', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope',
                    function() {
                    testDeclStatements(checker, 'function a() { var b; }', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after prologue', function() {
                    testDeclStatements(checker, 'function a() { "use strict"; var b; }', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after single comment', function() {
                    testDeclStatements(checker, 'function a() { /*block comment*/ var b; }', 0);
                });

                it('should not return errors for multiple var declaration at top of program scope', function() {
                    testDeclStatements(checker, 'var a, A; var b;', 0);
                });

                it('should not return errors for a single var declaration with comments sandwiched ' +
                    'between multiple declarators', function() {
                    testDeclStatements(checker,
                        'function tst(node) { var array, /* array of class names */ ncn = node.className; }', 0);
                });
            });

            describe('statements with linebreaks', function() {
                it('should not return errors for single var declaration at top of program scope', function() {
                    testDeclStatements(checker, '\nvar a;', 0);
                });

                it('should not return errors for single var declaration at top of program scope after prologue',
                    function() {
                    testDeclStatements(checker, '"use strict";\nvar a;', 0);
                });

                it('should not return errors for single var declaration after single comment at top of program scope',
                    function() {
                    testDeclStatements(checker, '/*block comment*/\nvar a;', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope',
                    function() {
                    testDeclStatements(checker, 'function a() {\nvar b;\n}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after prologue', function() {
                    testDeclStatements(checker, 'function a() {\n"use strict";\nvar b;\n}', 0);
                });

                it('should not return errors for single var declaration at top of function declaration scope ' +
                    'after single comment', function() {
                    testDeclStatements(checker, 'function a() {\n/*block comment*/\nvar b;\n}', 0);
                });

                it('should not return errors for multiple var declaration at top of program scope', function() {
                    testDeclStatements(checker, 'var a, A;\nvar b;', 0);
                });

                it('should not return errors for a single var declaration with comments sandwiched ' +
                    'between multiple declarators', function() {
                    testDeclStatements(checker,
                        'function tst(node) {\nvar array,\n/* array of class names */\nncn = node.className;\n}', 0);
                });

                it('should not return errors for multiple var declaration with a comment inside the scope of' +
                ' first variable declaration', function() {
                    testDeclStatements(checker, 'var a = function() {  var b;\n/*block comment*/\n}, A;\nvar c;', 0);
                });
            });

            describe('statements inside blocks', function() {
                it('should report for single var declaration inside block', function() {
                    testDeclStatements(checker, '{var a;}', 1);
                });

                it('should report for single var declaration at top of program scope after prologue',
                    function() {
                    testDeclStatements(checker, '{"use strict";\nvar a;}', 1);
                });

                it('should report for single var declaration after single comment inside a block',
                    function() {
                    testDeclStatements(checker, '{/*block comment*/\nvar a;}', 1);
                });

                it('should report for single var decl inside a block after assignment',
                    function() {
                    testDeclStatements(checker, 'x=1;{var a;}', 1);
                });
            });
        });
    });
});
