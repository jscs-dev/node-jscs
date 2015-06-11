var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-function', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunction: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in Function', function() {
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should not report missing space before round brace in named Function', function() {
            assert(checker.checkString('var x = function a(){}').isEmpty());
        });

        it('should report space before round brace in Function', function() {
            assert(checker.checkString('var x = function (){}').getErrorCount() === 1);
        });

        it('should report space before round brace in named Function', function() {
            assert(checker.checkString('var x = function a (){}').getErrorCount() === 1);
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc(){}').isEmpty());
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            assert(checker.checkString('function abc (){}').getErrorCount() === 1);
        });

        it('should not report space before round brace in getter', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before round brace in setter', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before round brace in getter', function() {
            assert(checker.checkString('var x = { get y() {} }').isEmpty());
        });

        it('should not report missing space before round brace in setter', function() {
            assert(checker.checkString('var x = { set y(v) {} }').isEmpty());
        });

        it('should report space before round brace in class method', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('const Component = class { render () { return 1; } };').getErrorCount() === 1);
        });

        it('should not report missing space before round brace in class method', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('const Component = class { render() { return 1; } };').isEmpty());
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunction: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in Function', function() {
            assert(checker.checkString('var x = function(){}').isEmpty());
        });

        it('should report space before curly brace in Function', function() {
            assert(checker.checkString('var x = function() {}').getErrorCount() === 1);
        });

        it('should not report space before curly brace in getter', function() {
            assert(checker.checkString('var x = { get y () {} }').isEmpty());
        });

        it('should not report space before curly brace in of setter', function() {
            assert(checker.checkString('var x = { set y (v) {} }').isEmpty());
        });

        it('should not report missing space before curly brace in getter', function() {
            assert(checker.checkString('var x = { get y (){} }').isEmpty());
        });

        it('should not report missing space before curly brace in setter', function() {
            assert(checker.checkString('var x = { set y (v){} }').isEmpty());
        });

        it('should not report missing space before round brace without option', function() {
            assert(checker.checkString('var x = function (){}').isEmpty());
        });
    });
});
