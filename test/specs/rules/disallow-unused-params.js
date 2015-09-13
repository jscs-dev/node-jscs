var assert = require('assert');

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

    reportAndFix({
        name: 'function a(b) {}',
        rules: config,
        errors: 1,
        input: 'function a(b) {}',
        output: 'function a() {}'
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
        errors: 1,
        input: 'function a(b, c) { return c; }',
        output: 'function a(c) { return c; }'
    });

    reportAndFix({
        name: 'function a(b, c) { var t = c; return t; }',
        rules: config,
        errors: 1,
        input: 'function a(b, c) { var t = c; return t; }',
        output: 'function a(c) { var t = c; return t; }'
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
        output: 'function a(b, c) { var t = c; var z = b; return {t: t, z: z}; }',
    });

    reportAndFix({
        name: 'function a(b, c, d) { return c; }',
        rules: config,
        errors: 2,
        input: 'function a(b, c, d) { return c; }',
        output: 'function a(c) { return c; }',
    });

    reportAndFix({
        name: 'var a = function(b, c, d) { return c; }',
        rules: config,
        errors: 2,
        input: 'var a = function(b, c, d) { return c; }',
        output: 'var a = function(c) { return c; }',
    });
});
