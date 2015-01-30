var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-semicolons', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSemicolons: true });
    });

    describe('var declaration', function() {
        describe('valid', function() {
            it('var a;', function() {
                assert(checker.checkString('var a;').isEmpty());
            });

            it('var a\\n,b;', function() {
                assert(checker.checkString('var a\n,b;').isEmpty());
            });

            it('var a\\n,b\\n = 1;', function() {
                assert(checker.checkString('var a\n,b\n = 1;').isEmpty());
            });

            it('var a\\n,b\\n = 1 ;', function() {
                assert(checker.checkString('var a\n,b\n = 1 ;').isEmpty());
            });

            it('for (var a in b){}', function() {
                assert(checker.checkString('for (var a in b){}').isEmpty());
            });

            it('for (var a in b){ var c; }', function() {
                assert(checker.checkString('for (var a in b){ var c; }').isEmpty());
            });

            it('for (var a;;){}', function() {
                assert(checker.checkString('for (var a;;){}').isEmpty());
            });

            it('for (;;) var a;', function() {
                assert(checker.checkString('for (var a;;) var a;').isEmpty());
            });

            it('var a\\n,b \\n;', function() {
                assert(checker.checkString('var a\n,b \n;').isEmpty());
            });

            it('var a\\n,b\\n = 1\\n;', function() {
                assert(checker.checkString('var a\n,b\n = 1\n;').isEmpty());
            });
        });

        describe('invalid', function() {
            it('var a', function() {
                assert(checker.checkString('var a').getErrorCount() === 1);
            });

            it('var a\\n,b \\n', function() {
                assert(checker.checkString('var a\n,b \n').getErrorCount() === 1);
            });

            it('var a\\n,b\\n = 1//;', function() {
                assert(checker.checkString('var a\n,b\n = 1//;').getErrorCount() === 1);
            });

            it('var a\\n,b\\n = 1\\n//;', function() {
                assert(checker.checkString('var a\n,b\n = 1\n//;').getErrorCount() === 1);
            });

            it('for (var a in b) var c', function() {
                assert(checker.checkString('for (var a in b) var c').getErrorCount() === 1);
            });

            it('for (;;) var a', function() {
                assert(checker.checkString('for (var a;;) var a').getErrorCount() === 1);
            });
        });
    });

    describe('expression statement', function() {
        describe('valid', function() {
            it('a;', function() {
                assert(checker.checkString('a;').isEmpty());
            });

            it('a\\n,b;', function() {
                assert(checker.checkString('a\n,b;').isEmpty());
            });

            it('a\\n,b\\n = 1;', function() {
                assert(checker.checkString('a\n,b\n = 1;').isEmpty());
            });

            it('a\\n,b\\n = 1 ;', function() {
                assert(checker.checkString('a\n,b\n = 1 ;').isEmpty());
            });

            it('a\\n;', function() {
                assert(checker.checkString('a\n;').isEmpty());
            });

            it('a\\n = 1\\n;', function() {
                assert(checker.checkString('a\n = 1\n;').isEmpty());
            });
        });

        describe('invalid', function() {
            it('a', function() {
                assert(checker.checkString('a').getErrorCount() === 1);
            });

            it('a\\n', function() {
                assert(checker.checkString('a\n').getErrorCount() === 1);
            });

            it('a\\n = 1//;', function() {
                assert(checker.checkString('a\n = 1//;').getErrorCount() === 1);
            });

            it('a\\n = 1\\n//;', function() {
                assert(checker.checkString('a\n = 1\n//;').getErrorCount() === 1);
            });
        });
    });

    describe('return statement', function() {
        describe('valid', function() {
            it('function foo(){ return; }', function() {
                assert(checker.checkString('function foo(){ return; }').isEmpty());
            });

            it('function foo(){ return a; }', function() {
                assert(checker.checkString('function foo(){ return a; }').isEmpty());
            });

            it('function foo(){ return a\\n,b; }', function() {
                assert(checker.checkString('function foo(){ return a\n,b; }').isEmpty());
            });

            it('function foo(){ return a\\n; }', function() {
                assert(checker.checkString('function foo(){ return a\n; }').isEmpty());
            });
        });

        describe('invalid', function() {
            it('function foo(){ return }', function() {
                assert(checker.checkString('function foo(){ return }').getErrorCount() === 1);
            });

            it('function foo(){ return a }', function() {
                assert(checker.checkString('function foo(){ return a }').getErrorCount() === 1);
            });

            it('function foo(){ return\\n; }', function() {
                assert(checker.checkString('function foo(){ return\n; }').getErrorCount() === 1);
            });

            it('function foo(){ return a//;\\n }', function() {
                assert(checker.checkString('function foo(){ return a//;\n }').getErrorCount() === 1);
            });

            it('function foo(){ return a\\n,b }', function() {
                assert(checker.checkString('function foo(){ return a\n,b }').getErrorCount() === 1);
            });

            it('function foo(){ return a\\n,b//;\\n }', function() {
                assert(checker.checkString('function foo(){ return a\n,b//;\n }').getErrorCount() === 1);
            });
        });
    });

    describe('throw statement', function() {
        describe('valid', function() {
            it('throw "Error";', function() {
                assert(checker.checkString('throw "Error";').isEmpty());
            });
        });

        describe('invalid', function() {
            it('throw "Error"', function() {
                assert(checker.checkString('throw "Error"').getErrorCount() === 1);
            });
        });
    });

    describe('break statement', function() {
        describe('valid', function() {
            it('for (;;) break;', function() {
                assert(checker.checkString('for (;;) break;').isEmpty());
            });

            it('switch (a) { case "x": break; }', function() {
                assert(checker.checkString('switch (a) { case "x": break; }').isEmpty());
            });
        });

        describe('invalid', function() {
            it('for (;;) break', function() {
                assert(checker.checkString('for (;;) break').getErrorCount() === 1);
            });

            it('switch (a) { case "x": break }', function() {
                assert(checker.checkString('switch (a) { case "x": break }').getErrorCount() === 1);
            });
        });
    });

    describe('continue statement', function() {
        describe('valid', function() {
            it('for (;;) continue;', function() {
                assert(checker.checkString('for (;;) continue;').isEmpty());
            });
        });

        describe('invalid', function() {
            it('for (;;) continue', function() {
                assert(checker.checkString('for (;;) continue').getErrorCount() === 1);
            });
        });
    });

    describe('do-while statement', function() {
        describe('valid', function() {
            it('do {} while (expr);', function() {
                assert(checker.checkString('do {} while (expr);').isEmpty());
            });
        });

        describe('invalid', function() {
            it('do {} while (expr)', function() {
                assert(checker.checkString('do {} while (expr)').getErrorCount() === 1);
            });

            it('do {} while (expr)//;', function() {
                assert(checker.checkString('do {} while (expr)//;').getErrorCount() === 1);
            });

            it('do {} while (expr)\\n//;', function() {
                assert(checker.checkString('do {} while (expr)\n//;').getErrorCount() === 1);
            });
        });
    });
});
