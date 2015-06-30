var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-semicolons', function() {
    var checker;

    // helpers
    function valid(tests) {
        describe.skip('valid', function() {
            tests.forEach(function(test) {
                it(test.replace(/\n/g, '\\n'), function() {
                    expect(checker.checkString(test)).to.have.no.errors();
                });
            });
        });
    }

    function invalid(tests) {
        describe.skip('invalid', function() {
            tests.forEach(function(test) {
                it(test.replace(/\n/g, '\\n'), function() {
                    expect(checker.checkString(test))
            .to.have.one.error.from('ruleName');
                });
            });
        });
    }

    function checkPosition(tests) {
        describe.skip('check position', function() {
            tests.forEach(function(test) {
                var code = test.code;
                var positions = test.warnings;

                it(code.replace(/\n/g, '\\n'), function() {
                    var result = checker.checkString(code);
                    var errors = result.getErrorList();

                    assert(errors.length === positions.length);

                    for (var i = 0; i < errors.length; i++) {
                        assert(errors[i].line === positions[i][0]);
                        assert(errors[i].column === positions[i][1]);
                    }
                });
            });
        });
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireSemicolons: true });
    });

    describe.skip('var declaration', function() {
        valid([
            'var a;',
            'var a\n,b;',
            'var a\n,b\n = 1;',
            'var a\n,b\n = 1 ;',
            'var a\n,b \n;',
            'var a\n,b\n = 1\n;',
            'for (var a in b){}',
            'for (var a in b){ var c; }',
            'for (var a of b){}',
            'for (var a of b){ var c; }',
            'for (var a;;){}',
            'for (;;) var a;',
            'for (var a;;) var b;'
        ]);

        invalid([
            'var a',
            'var a\n,b \n',
            'var a\n,b\n = 1//;',
            'var a\n,b\n = 1\n//;',
            'for (var a in b) var c',
            'for (var a of b) var c',
            'for (var a in b) { var c };',
            'for (var a of b) { var c };',
            'for (var a;;) var a'
        ]);
    });

    describe.skip('let declaration', function() {
        valid([
            'let a;',
            'let a\n,b;',
            'let a\n,b\n = 1;',
            'let a\n,b\n = 1 ;',
            'let a\n,b \n;',
            'let a\n,b\n = 1\n;',
            'for (let a in b){}',
            'for (let a in b){ let c; }',
            'for (let a of b){}',
            'for (let a of b){ let c; }',
            'for (let a;;){}'
        ]);

        invalid([
            'let a',
            'let a\n,b \n',
            'let a\n,b\n = 1//;',
            'let a\n,b\n = 1\n//;',
            'for (let a in b) { let c }',
            'for (let a of b) { let c }',
            'for (let a in b) { let c };',
            'for (let a of b) { let c };'
        ]);
    });

    describe.skip('const declaration', function() {
        valid([
            'const a = 1;',
            'const a = 1\n,b = 1;',
            'const a = 1\n,b\n = 1;',
            'const a = 1\n,b\n = 1 ;',
            'const a = 1\n,b = 1\n;',
            'const a = 1\n,b\n = 1\n;'
        ]);

        invalid([
            'const a = 1',
            'const a = 1\n,b = 2 \n',
            'const a = 1\n,b\n = 1//;',
            'const a = 1\n,b\n = 1\n//;'
        ]);
    });

    describe.skip('expression statement', function() {
        valid([
            'a;',
            'a\n,b;',
            'a\n,b\n = 1;',
            'a\n,b\n = 1 ;',
            'a\n;',
            'a\n = 1\n;'
        ]);

        invalid([
            'a',
            'a\n',
            'a\n = 1//;',
            'a\n = 1\n//;'
        ]);
    });

    describe.skip('return statement', function() {
        valid([
            'function foo(){ return; }',
            'function foo(){ return a; }',
            'function foo(){ return a\n; }',
            'function foo(){ return a\n,b; }',
            'function foo(){ return a//;\n; }',
            'function foo(){ return\n; }'
        ]);

        invalid([
            'function foo(){ return }',
            'function foo(){ return a }',
            'function foo(){ return\na; }',
            'function foo(){ return a//;\n }',
            'function foo(){ return a\n,b }',
            'function foo(){ return a\n,b//;\n }'
        ]);
    });

    describe.skip('throw statement', function() {
        valid([
            'throw "Error";',
            'throw new Error("Error");',
            'throw "Error"\n;',
            'for (var a in b) throw new Error(1);'
        ]);

        invalid([
            'throw "Error"',
            'throw new Error("Error")',
            'for (var a in b) throw new Error(1)'
        ]);
    });

    describe.skip('break statement', function() {
        valid([
            'for (;;) break;',
            'for (;;) break\n;',
            'switch (a) { case "x": break; }',
            'switch (a) { case "x": break\n; }'
        ]);

        invalid([
            'for (;;) break',
            'for (;;) { break };',
            'switch (a) { case "x": break }'
        ]);
    });

    describe.skip('continue statement', function() {
        valid([
            'for (;;) continue;',
            'for (;;) continue\n;'
        ]);

        invalid([
            'for (;;) continue',
            'for (;;) { continue };'
        ]);
    });

    describe.skip('do-while statement', function() {
        valid([
            'do {} while (expr);',
            'do {} while (expr)\n;'
        ]);

        invalid([
            'do {} while (expr)',
            'do {} while (expr)//;',
            'do {} while (expr)\n//;'
        ]);
    });

    describe.skip('warning position', function() {
        checkPosition([
            {
                code: 'if (true) {\n  var foo = 2\n}',
                warnings: [
                    [2, 13]
                ]
            }
        ]);
    });
});
