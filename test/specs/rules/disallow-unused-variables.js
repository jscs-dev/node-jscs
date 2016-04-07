var expect = require('chai').expect;

var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-unused-variables', function() {
    var checker;
    var config = { disallowUnusedVariables: true };

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(config);
    });

    it('should not report unused variable defined with var', function() {
        expect(checker.checkString('var x=1; function y(){ return x; }')).to.have.no.errors();
    });

    it('should not report unused variable defined with let', function() {
        expect(checker.checkString('let x=1; function y(){ return x; }')).to.have.no.errors();
    });

    it('should not report unused variable defined with const', function() {
        expect(checker.checkString('const x=1; function y(){ return x; }')).to.have.no.errors();
    });

    it('should not report unused variable defined with var within a function declaration', function() {
        expect(checker.checkString('function x() { var y=1; return y; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with let within a function declaration', function() {
        expect(checker.checkString('function x() { let y=1; return y; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with const within a function declaration', function() {
        expect(checker.checkString('function x() { const y=1; return y; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with var within a arrow function expression', function() {
        expect(checker.checkString('() => { var x=1; return x; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with let within a arrow function expression', function() {
        expect(checker.checkString('() => { let x=1; return x; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with const within a arrow function expression', function() {
        expect(checker.checkString('() => { const x=1; return x; }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with var within a function expression', function() {
        expect(checker.checkString('(function() { var x=1; return x; })'))
            .to.have.no.errors();
    });
 
    it('should not report unused variable defined with let within a function expression', function() {
        expect(checker.checkString('(function() { let x=1; return x; })'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with const within a function expression', function() {
        expect(checker.checkString('(function() { const x=1; return x; })'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with var that is exported', function() {
        expect(checker.checkString('export var x=1;'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with let that is exported', function() {
        expect(checker.checkString('export let x=1;'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with const that is exported', function() {
        expect(checker.checkString('export const x=1;'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with var within a class', function() {
        expect(checker.checkString('class P { test() { var x=1; return x; } }'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with let within a class', function() {
        expect(checker.checkString('class P { test() { let x=1; return x; } }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with const within a class', function() {
        expect(checker.checkString('class P { test() { const x=1; return x;} }'))
            .to.have.no.errors();
    });

    it('should not report unused variable defined with var for a ObjectPattern', function() {
        expect(checker.checkString('var { x, y } = 1; function doXY() { return x * y; }'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with let for a ObjectPattern', function() {
        expect(checker.checkString('let { x, y } = 1; function doXY() { return x * y; }'))
            .to.have.no.errors();
    }); 

    it('should not report unused variable defined with const for a ObjectPattern', function() {
        expect(checker.checkString('const { x, y } = 1; function doXY() { return x * y; }'))
            .to.have.no.errors();
    }); 

    it('should report unused variable defined with var', function() {
        expect(checker.checkString('var x=1'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with let', function() {
        expect(checker.checkString('let x=1'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    }); 

    it('should report unused variable defined with const', function() {
        expect(checker.checkString('const x=1'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    }); 
 
    it('should report unused variable defined with var within a function declaration', function() {
        expect(checker.checkString('function x() { var y=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
    });

    it('should report unused variable defined with let within a function declaration', function() {
        expect(checker.checkString('function x() { let y=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
    });

    it('should report unused variable defined with const within a function declaration', function() {
        expect(checker.checkString('function x() { const y=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
    });

    it('should report unused variable defined with var within a arrow function expression', function() {
        expect(checker.checkString('() => { var x=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });
 
    it('should report unused variable defined with let within a arrow function expression', function() {
        expect(checker.checkString('() => { let x=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with const within a arrow function expression', function() {
        expect(checker.checkString('() => { const x=1; }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with var within a function expression', function() {
        expect(checker.checkString('(function() { var x=1; })'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with var within a class', function() {
        expect(checker.checkString('class P { test() { var x=1; } }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    }); 

    it('should report unused variable defined with let within a class', function() {
        expect(checker.checkString('class P { test() { let x=1; } }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with const within a class', function() {
        expect(checker.checkString('class P { test() { const x=1; } }'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
    });

    it('should report unused variable defined with var for a ObjectPattern', function() {
        expect(checker.checkString('var { x, y } = 1;'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
            .have.error.count.equal(2)
    });

    it('should report unused variable defined with let for a ObjectPattern', function() {
        expect(checker.checkString('let { x, y } = 1;'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
            .have.error.count.equal(2)
    });

    it('should report unused variable defined with const for a ObjectPattern', function() {
        expect(checker.checkString('const { x, y } = 1;'))
            .to.contain.error('disallowUnusedVariables: Variable `x` is not used')
            .to.contain.error('disallowUnusedVariables: Variable `y` is not used')
            .have.error.count.equal(2)
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var x=1; function y() {}',
        output: ' function y() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'let x=1; function y() {}',
        output: ' function y() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'const x=1; function y() {}',
        output: ' function y() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function x() {var y=1;}',
        output: 'function x() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function x() {let y=1;}',
        output: 'function x() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function x() {const y=1;}',
        output: 'function x() {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '() => {var x=1;}',
        output: '() => {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '() => {let x=1;}',
        output: '() => {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '() => {const x=1;}',
        output: '() => {}'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '(function() {var x=1;})',
        output: '(function() {})'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '(function() {let x=1;})',
        output: '(function() {})'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: '(function() {const x=1;})',
        output: '(function() {})'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'class P { test() {var x=1;} }',
        output: 'class P { test() {} }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'class P { test() {let x=1;} }',
        output: 'class P { test() {} }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'class P { test() {const x=1;} }',
        output: 'class P { test() {} }'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'var { x, y } = 1;',
        output: ''
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'let { x, y } = 1;',
        output: ''
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'const { x, y } = 1;',
        output: ''
    });

});

