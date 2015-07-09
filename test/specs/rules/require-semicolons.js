var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-semicolons', function() {
    var checker;

    // helpers
    function valid(tests) {
        describe('valid', function() {
            tests.forEach(function(test) {
                it(test.replace(/\n/g, '\\n'), function() {
                    assert(checker.checkString(test).isEmpty());
                });
            });
        });
    }

    function invalid(tests) {
        describe('invalid', function() {
            tests.forEach(function(test) {
                it(test.replace(/\n/g, '\\n'), function() {
                    assert(checker.checkString(test).getErrorCount() === 1);
                });
            });
        });
    }

    function checkPosition(tests) {
        describe('check position', function() {
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

    describe('var declaration', function() {
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
            'var a\n,b\n = 1',
            'for (var a in b) var c',
            'for (var a of b) var c',
            'for (var a in b) { var c };',
            'for (var a of b) { var c };',
            'for (var a;;) var a'
        ]);
    });

    describe('let declaration', function() {
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

    describe('const declaration', function() {
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
            'const a = 1\n,b\n = 1'
        ]);
    });

    describe('expression statement', function() {
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
            'a\n'
        ]);
    });

    describe('return statement', function() {
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

    describe('throw statement', function() {
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

    describe('break statement', function() {
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

    describe('continue statement', function() {
        valid([
            'for (;;) continue;',
            'for (;;) continue\n;'
        ]);

        invalid([
            'for (;;) continue',
            'for (;;) { continue };'
        ]);
    });

    describe('do-while statement', function() {
        valid([
            'do {} while (expr);',
            'do {} while (expr)\n;'
        ]);

        invalid([
            'do {} while (expr)'
        ]);
    });

    describe('import declaration', function() {
        valid([
            'import foo from "module";',
            'import foo from "module"\n;',
            'import "module";',
            'import "module"\n;'
        ]);

        invalid([
            'import foo from "module"',
            'import "module"'
        ]);
    });

    describe('export declaration', function() {
        valid([
            'export default foo;',
            'export default foo\n;',
            'export { foo };',
            'export { foo }\n;',
            'export { foo as default };',
            'export { foo as default }\n;',
            'export function foo(){}',
            'export default function foo(){}',
            'export class MyClass {}',
            'export default class MyClass {}'
        ]);

        invalid([
            'export default foo',
            'export { foo }',
            'export { foo as default }'
        ]);
    });

    describe('warning position', function() {
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
