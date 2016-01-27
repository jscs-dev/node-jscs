var expect = require('chai').expect;

var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-semicolons', function() {
    var checker;

    var config = { requireSemicolons: true };

    // helpers
    function valid(tests) {
        describe('valid', function() {
            tests.forEach(function(test) {
                it(test.replace(/\n/g, '\\n'), function() {
                    expect(checker.checkString(test)).to.have.no.errors();
                });
            });
        });
    }

    function invalid(tests) {
        describe('invalid', function() {
            tests.forEach(function(test) {
                var name = test.replace(/\n/g, '\\n');

                it(name, function() {
                    expect(checker.checkString(test)).to.have.one.validation.error.from('requireSemicolons');
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

                    expect(errors.length).to.equal(positions.length);

                    for (var i = 0; i < errors.length; i++) {
                        expect(errors[i].line).to.equal(positions[i][0]);
                        expect(errors[i].column).to.equal(positions[i][1]);
                    }
                });
            });
        });
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(config);
    });

    describe('debugger', function() {
        valid([
            'debugger;'
        ]);

        invalid([
            'debugger'
        ]);

        reportAndFix({
            name: 'debugger',
            rules: config,
            errors: 1,
            input: 'debugger',
            output: 'debugger;'
        });
    });

    describe('var declaration', function() {
        valid([
            'var a;',
            'var a\n,b;',
            'var a\n,b\n = 1;',
            'var a\n,b\n = 1 ;',
            'var a\n,b; \n',
            'var a\n,b\n = 1;\n',
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

        reportAndFix({
            name: 'var a',
            rules: config,
            errors: 1,
            input: 'var a',
            output: 'var a;'
        });

        reportAndFix({
            name: 'var a<newline>,b <newline>',
            rules: config,
            errors: 1,
            input: 'var a\n,b \n',
            output: 'var a\n,b; \n'
        });

        reportAndFix({
            name: 'var a<newline>,b<newline> = 1',
            rules: config,
            errors: 1,
            input: 'var a\n,b\n = 1',
            output: 'var a\n,b\n = 1;'
        });

        reportAndFix({
            name: 'for (var a in b) { var c };',
            rules: config,
            errors: 1,
            input: 'for (var a in b) { var c };',
            output: 'for (var a in b) { var c; };'
        });

        reportAndFix({
            name: 'for (var a;;) var a',
            rules: config,
            errors: 1,
            input: 'for (var a;;) var a',
            output: 'for (var a;;) var a;'
        });
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

        reportAndFix({
            name: 'for (let a in b) { let c }',
            rules: config,
            errors: 1,
            input: 'for (let a in b) { let c }',
            output: 'for (let a in b) { let c; }'
        });
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

        reportAndFix({
            name: 'const a = 1<newline>,b<newline> = 1',
            rules: config,
            errors: 1,
            input: 'const a = 1\n,b\n = 1',
            output: 'const a = 1\n,b\n = 1;'
        });
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

        reportAndFix({
            name: 'expression statement',
            rules: config,
            errors: 1,
            input: 'a',
            output: 'a;'
        });
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

        reportAndFix({
            name: 'function foo(){ return a<newline>,b }',
            rules: config,
            errors: 1,
            input: 'function foo(){ return a\n,b }',
            output: 'function foo(){ return a\n,b; }'
        });
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

        reportAndFix({
            name: 'for (var a in b) throw new Error(1)',
            rules: config,
            errors: 1,
            input: 'for (var a in b) throw new Error(1)',
            output: 'for (var a in b) throw new Error(1);'
        });
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

        reportAndFix({
            name: 'switch (a) { case "x": break }',
            rules: config,
            errors: 1,
            input: 'switch (a) { case "x": break }',
            output: 'switch (a) { case "x": break; }'
        });
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

        reportAndFix({
            name: 'for (;;) { continue };',
            rules: config,
            errors: 1,
            input: 'for (;;) { continue };',
            output: 'for (;;) { continue; };'
        });
    });

    describe('do-while statement', function() {
        valid([
            'do {} while (expr);',
            'do {} while (expr)\n;'
        ]);

        invalid([
            'do {} while (expr)'
        ]);

        reportAndFix({
            name: 'do {} while (expr)',
            rules: config,
            errors: 1,
            input: 'do {} while (expr)',
            output: 'do {} while (expr);'
        });
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

        reportAndFix({
            name: 'import foo from "module"',
            rules: config,
            errors: 1,
            input: 'import foo from "module"',
            output: 'import foo from "module";'
        });
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

        reportAndFix({
            name: 'export default foo',
            rules: config,
            errors: 1,
            input: 'export default foo',
            output: 'export default foo;'
        });
    });

    // TODO: add ClassProperty support in CST
    describe.skip('class property', function() {
        valid([
            'class A { asdf; }',
            'export class A { asdf; }',
            'export default class A { asdf; }',
            'export default class A { asdf = 1; }'
        ]);

        invalid([
            'class A { asdf }',
            'export class A { asdf }',
            'export default class A { asdf }',
            'export default class A { asdf = 1 }'
        ]);

        reportAndFix({
            name: 'class A { asdf }',
            rules: config,
            errors: 1,
            input: 'class A { asdf }',
            output: 'class A { asdf; }'
        });

        reportAndFix({
            name: 'class A { asdf = 1 }',
            rules: config,
            errors: 1,
            input: 'class A { asdf = 1 }',
            output: 'class A { asdf = 1; }'
        });
    });

    reportAndFix({
        name: 'expression call with comments',
        rules: config,
        errors: 1,
        input: 'call()\n // comment',
        output: 'call();\n // comment'
    });

    describe('warning position', function() {
        checkPosition([
            {
                code: 'if (true) {\n  var foo = 2\n}',
                warnings: [
                    [2, 12]
                ]
            }
        ]);
    });
});
