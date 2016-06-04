var expect = require('chai').expect;

var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-unused-params', function() {
    var checker;
    var config = { disallowUnusedParams: true };

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(config);
    });

    it('should not report first argument is if second one is used', function() {
        expect(checker.checkString('function a(b, c) { return c; };')).to.have.no.errors();
    });

    it('should not report even with eval expression (gh-1943)', function() {
        expect(checker.checkString('function foo(options) { return options; eval() };'))
            .to.have.no.errors();
    });

    it('should not report on param that used in child scope', function() {
        expect(checker.checkString(
            'function a(b) { return function () { return b; }; }'
        )).to.have.no.errors();
    });

    it('should not error with es6 imports #1875', function() {
        expect(checker.checkString(
            'import one from "one"; function some() {}'
        )).to.have.no.errors();
    });

    it('should report unused param', function() {
        expect(checker.checkString(
            'function fun(test) { }'
        ).getErrorList()[0].message).to.contain('Param `test` is not used');
    });

    it('should report for AssignmentPattern (gh-2254)', function() {
        expect(checker.checkString('function foo(options = {}) {};')
            .getErrorList()[0].message).to.contain('Param `options` is not used');
    });

    it('should report unused param in function expression', function() {
        expect(checker.checkString(
            '(function(test) { })'
        ).getErrorList()[0].message).to.contain('Param `test` is not used');
    });

    it('should report unused param in arrow function expression', function() {
        expect(checker.checkString(
            '((test) => { })'
        ).getErrorList()[0].message).to.contain('Param `test` is not used');
    });

    it('should report unused rest param', function() {
        expect(checker.checkString(
            'function fun(...test) { }'
        ).getErrorList()[0].message).to.contain('Pattern is not used');
    });

    it('should report unused param in half-used pattern', function() {
        expect(checker.checkString(
            'function fun({test, g}) { g++; }'
        ).getErrorList()[0].message).to.contain('Param `test` is not used');
    });

    it('should report unused object pattern', function() {
        expect(checker.checkString(
            'function fun({test, g}) { }'
        ).getErrorList()[0].message).to.contain('Pattern is not used');
    });

    it('should report unused object pattern after unused param', function() {
        expect(checker.checkString(
            'function fun({test, g}, h) { }'
        )).to
            .contain.error('disallowUnusedParams: Pattern is not used')
            .contain.error('disallowUnusedParams: Param `h` is not used')
            .have.error.count.equal(2);
    });

    it('should report unused object pattern values after used param', function() {
        expect(checker.checkString(
            'function fun({test, g}, h) { h++; }'
        )).to
            .contain.error('disallowUnusedParams: Param `test` is not used')
            .contain.error('disallowUnusedParams: Param `g` is not used')
            .have.error.count.equal(2);
    });

    it('should report unused array pattern', function() {
        expect(checker.checkString(
            'function fun([test, g]) { }'
        ).getErrorList()[0].message).to.contain('Pattern is not used');
    });

    it('should report unused array pattern after unused param', function() {
        expect(checker.checkString(
            'function fun([test, g], h) { }'
        )).to
            .contain.error('disallowUnusedParams: Pattern is not used')
            .contain.error('disallowUnusedParams: Param `h` is not used')
            .have.error.count.equal(2);
    });

    it('should report unused array pattern values after used param', function() {
        expect(checker.checkString(
            'function fun([test, g], h) { h++; }'
        )).to
            .contain.error('disallowUnusedParams: Param `test` is not used')
            .contain.error('disallowUnusedParams: Param `g` is not used')
            .have.error.count.equal(2);
    });

    it('should properly report unused params', function() {
        expect(checker.checkString(
            'function a(b, c, d) { var t = c; var z = b; return {t: t, z: z}; }'
        )).to
            .contain.error('disallowUnusedParams: Param `d` is not used')
            .have.error.count.equal(1);
    });

    it('should not fail on rest usage in object (#2062)', function() {
        expect(checker.checkString(
            'function test ( data ) {var opts = { ...data };}'
        )).to.have.no.errors();
    });

    it('should not fail on JSX usage (#2062)', function() {
        expect(checker.checkString(
            'function foo(Component) {<Component></Component>}'
        )).to.have.no.errors();
    });

    it('should not fail on ES6 classes (#2002)', function() {
        expect(checker.checkString(
            'export default class extends Parent { constructor() { super("hi parent"); }}'
        )).to.have.no.errors();
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function a(b) {}',
        output: 'function a() {}'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'slice(0, i);\nfunction a(obj, tail) {}',
        output: 'slice(0, i);\nfunction a() {}'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'function a(b, c) {}',
        output: 'function a() {}'
    });

    reportAndFix({
        rules: config,
        errors: 0,
        input: 'function a(b, c) { return c; }',
        output: 'function a(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 0,
        input: 'function a(b, c) { return c; }',
        output: 'function a(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function a(b, c) { var t = b; return t; }',
        output: 'function a(b) { var t = b; return t; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'function a(b, c, d) { var t = c; var z = b; return {t: t, z: z}; }',
        output: 'function a(b, c) { var t = c; var z = b; return {t: t, z: z}; }'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'function a(b, c, d) { return b; }',
        output: 'function a(b) { return b; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, d) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'module.exports = function a(c, b) { return c; }',
        output: 'module.exports = function a(c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, {c, d}) { return c; }',
        output: 'var a = function(b, {c}) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, {c, x: d}) { return c + x; }',
        output: 'var a = function(b, {c}) { return c + x; }'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'var a = function(b, {c, x: {}, y: []}) { return c + x; }',
        output: 'var a = function(b, {c}) { return c + x; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, {c, x: {f}, y: []}) { return c + f; }',
        output: 'var a = function(b, {c, x: {f}}) { return c + f; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, {c, x: {d}, y: []}) { return c + d; }',
        output: 'var a = function(b, {c, x: {d}}) { return c + d; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, {c, x: {d, f}}) { return c + d; }',
        output: 'var a = function(b, {c, x: {d}}) { return c + d; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, {d, e}) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'var a = function(b, c, {d, e}, f) { return c + f; }',
        output: 'var a = function(b, c, {}, f) { return c + f; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, [c, d]) { return c; }',
        output: 'var a = function(b, [c]) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [d, e]) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [[d, e]]) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [[[d], [e]]]) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [[[d], [e]]]) { return c + e; }',
        output: 'var a = function(b, c, [[, [e]]]) { return c + e; }'
    });

    reportAndFix({
        rules: config,
        errors: 2,
        input: 'var a = function(b, c, [d, e], f) { return c + f; }',
        output: 'var a = function(b, c, [], f) { return c + f; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [d, e], f) { return c + f + e; }',
        output: 'var a = function(b, c, [, e], f) { return c + f + e; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [, e], f) { return c + f; }',
        output: 'var a = function(b, c, [], f) { return c + f; }'
    });

    reportAndFix({
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, [,,, e], f) { return c + f; }',
        output: 'var a = function(b, c, [], f) { return c + f; }'
    });
});
