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

    it('should not report on param that used in child scope', function() {
        expect(checker.checkString(
            'function a(b) { return function () { return b; }; }'
        )).to.have.no.errors();
    });

    reportAndFix({
        name: 'function a(b) {}',
        rules: config,
        errors: 1,
        input: 'function a(b) {}',
        output: 'function a() {}'
    });

    reportAndFix({
        name: 'slice(0, i);\nfunction a(obj, tail) {}',
        rules: config,
        errors: 2,
        input: 'slice(0, i);\nfunction a(obj, tail) {}',
        output: 'slice(0, i);\nfunction a() {}'
    });

    reportAndFix({
        name: 'function a(b, c) {}',
        rules: config,
        errors: 2,
        input: 'function a(b, c) {}',
        output: 'function a() {}'
    });

    reportAndFix({
        name: 'function a(b, c) { return c; }',
        rules: config,
        errors: 0,
        input: 'function a(b, c) { return c; }',
        output: 'function a(b, c) { return c; }'
    });

    reportAndFix({
        name: 'function a(b) { return function() { return b; }; }',
        rules: config,
        errors: 0,
        input: 'function a(b, c) { return c; }',
        output: 'function a(b, c) { return c; }'
    });

    reportAndFix({
        name: 'function a(b, c) { var t = b; return t; }',
        rules: config,
        errors: 1,
        input: 'function a(b, c) { var t = b; return t; }',
        output: 'function a(b) { var t = b; return t; }'
    });

    reportAndFix({
        name: 'function a(b, c, d) { var t = c; var z = b; return {t: t, z: z}; }',
        rules: config,
        errors: 1,
        input: 'function a(b, c, d) { var t = c; var z = b; return {t: t, z: z}; }',
        output: 'function a(b, c) { var t = c; var z = b; return {t: t, z: z}; }'
    });

    reportAndFix({
        name: 'function a(b, c, d) { return b; }',
        rules: config,
        errors: 2,
        input: 'function a(b, c, d) { return b; }',
        output: 'function a(b) { return b; }'
    });

    reportAndFix({
        name: 'var a = function(b, c, d) { return c; }',
        rules: config,
        errors: 1,
        input: 'var a = function(b, c, d) { return c; }',
        output: 'var a = function(b, c) { return c; }'
    });

    reportAndFix({
        name: 'module.exports = function a(c, b) { return c; }',
        rules: config,
        errors: 1,
        input: 'module.exports = function a(c, b) { return c; }',
        output: 'module.exports = function a(c) { return c; }'
    });
});
