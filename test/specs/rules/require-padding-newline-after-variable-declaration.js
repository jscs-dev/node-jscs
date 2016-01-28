var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-padding-newline-after-variable-declaration', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLineAfterVariableDeclaration: true });
    });

    it('should not report if an extra newline is present after var declaration', function() {
        expect(checker.checkString('var a = 1;\n\nconsole.log(a);')).to.have.no.errors();
        expect(checker.checkString('function a() { var a = 1;\n\nconsole.log(a); }')).to.have.no.errors();
        expect(checker.checkString('var b = 2;\n\nfunction a() { var a = 1;\n\nconsole.log(a); }')).to.have.no.errors();
        expect(checker.checkString(
            'var b = 2;\n\nfunction a() { var a = 1;\n\nconsole.log(a); } var c = 3;'
        )).to.have.no.errors();
    });

    it('should not report for consecutive var declarations', function() {
        expect(checker.checkString('var a = 1; var b = 2; var c = 3;')).to.have.no.errors();
    });

    it('should not report for consecutive const declarations', function() {
        expect(checker.checkString('const a = 1; const b = 2; const c = 3;')).to.have.no.errors();
    });

    it('should not report for consecutive let declarations', function() {
        expect(checker.checkString('let a = 1; let b = 2; let c = 3;')).to.have.no.errors();
    });

    it('should not report for consecutive var, const, let declarations', function() {
        expect(checker.checkString('var a = 1; const b = 2; let c = 3;')).to.have.no.errors();
    });

    it('should not report if var is the last expression in the block', function() {
        expect(checker.checkString('function a() { var x; }')).to.have.no.errors();
    });

    it('should report if no extra newline is present after var declaration', function() {
        expect(checker.checkString('var x; console.log(x);'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('function a() { var x; console.log(x); }'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('var y; function a() { var x; console.log(x); }')).to.have.error.count.equal(2);
    });

    it('should report if no extra newline is present after const declaration', function() {
        expect(checker.checkString('const x = 1; console.log(x);'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('function a() { const x = 2; console.log(x); }'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('const y = 1; function a() { const x = 3; console.log(x); }'))
          .to.have.error.count.equal(2);
    });

    it('should report if no extra newline is present after let declaration', function() {
        expect(checker.checkString('let x; console.log(x);'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('function a() { let x; console.log(x); }'))
          .to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
        expect(checker.checkString('let y; function a() { let x; console.log(x); }')).to.have.error.count.equal(2);
    });

    it('should not report when variables are defined in the init part of a for loop', function() {
        expect(checker.checkString('for (var i = 0, length = myArray.length; i < length; i++) {}')).to.have.no.errors();
        expect(checker.checkString('for (let i = 0, length = myArray.length; i < length; i++) {}')).to.have.no.errors();
    });

    it('should not report when variables are defined in the init part of a for in loop', function() {
        expect(checker.checkString('for (var i in arr) {}')).to.have.no.errors();
        expect(checker.checkString('for (let i in arr) {}')).to.have.no.errors();
    });

    it('should not report when variables are defined in the init part of a for of loop', function() {
        expect(checker.checkString('for (var i of arr) {}')).to.have.no.errors();
        expect(checker.checkString('for (let i of arr) {}')).to.have.no.errors();
    });

    it('should report if no extra newline is present after var declaration in the body of a for loop', function() {
        expect(checker.checkString(
            'for (var i = 0, length = myArray.length; i < length; i++) {' +
                'var x = 1;' +
                'console.log(x);' +
            '}'
        )).to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
    });

    it('should report if no extra newline is present after let declaration in the body of a for loop', function() {
        expect(checker.checkString(
            'for (let i = 0, length = myArray.length; i < length; i++) {' +
                'let x = 1;' +
                'console.log(x);' +
            '}'
        )).to.have.one.validation.error.from('requirePaddingNewLineAfterVariableDeclaration');
    });

    it('should not trip off on the semicolons (#1244)', function() {
        expect(checker.checkString(
            'var View = Backbone.View.extend({' +
                'initialize: function () {' +
                    'this.listenTo(this.doge, "woof", this.onWoof);' +
                    'this.listenTo(this.doge, "bark", this.onBark);' +
                '}' +
            '});'
        )).to.have.no.errors();
    });

    it('should not error on es6 exports #1882', function() {
        expect(checker.checkString('export var a = 1;')).to.have.no.errors();
        expect(checker.checkString('export let a = 1;')).to.have.no.errors();
        expect(checker.checkString('export const a = 1;')).to.have.no.errors();
    });
});
