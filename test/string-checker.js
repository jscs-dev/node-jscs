var Checker = require('../lib/checker');
var assert = require('assert');
var sinon = require('sinon');

describe('modules/string-checker', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('line starting with hash', function() {
        it('should ignore lines starting with #!', function() {
            assert(checker.checkString(
                '#! random stuff\n' +
                '#! 1234\n' +
                'var a = 5;\n'
            ).isEmpty());
        });

        it('should ignore ios instruments style import', function() {
            assert(checker.checkString(
                '#import "abc.js"\n' +
                '#import abc.js\n' +
                'var a = 5;\n'
            ).isEmpty());
        });

        it('should not replace when not beginning of line', function() {
            checker.configure({ disallowMultipleLineStrings: true });
            assert(checker.checkString(
                '#import "abc.js"\n' +
                'var b="#import \\\n abc.js";\n' +
                'var a = 5;\n'
            ).getErrorCount() === 1);
        });

        it('should report error in the correct location when first line starts with #!', function() {
            checker.configure({ disallowMultipleLineBreaks: true });
            var error = checker.checkString('#!/usr/bin/env node\n\n\nx = 1;').getErrorList()[0];
            assert.equal(error.line, 2);
            assert.equal(error.column, 0);
        });
    });

    it('should report parse issues as errors', function() {
        var errors = checker.checkString('this is not javascript');
        assert(errors.getErrorCount() === 1);

        var error = errors.getErrorList()[0];
        assert(error.rule === 'parseError');
        assert(error.message === 'Unexpected identifier');
        assert(error.line === 1);
        assert(error.column === 6);
    });

    it('should not process the rule if it is equals to null (#203)', function() {
        try {
            checker.configure({
                preset: 'jquery',
                requireCurlyBraces: null
            });
            assert(true);
        } catch (_) {
            assert(false);
        }
    });

    it('should throw if preset does not exist', function() {
        try {
            checker.configure({
                preset: 'not-exist'
            });

            assert(false);
        } catch (e) {
            assert.equal(e.toString(), 'AssertionError: Preset "not-exist" does not exist');
        }
    });

    describe('rules registration', function() {
        it('should report rules in config which don\'t match any registered rules', function() {
            checker.configure({ doesNotExist: true, noSuchRule: true });
            var errors = checker.checkString('var foo = 1;').getErrorList();

            assert(errors.length === 2);
            assert.equal(errors[0].message, 'Unsupported rule: doesNotExist');
            assert.equal(errors[1].message, 'Unsupported rule: noSuchRule');
        });

        it('should not report rules in config which match registered rules', function() {
            var error;
            try {
                checker.configure({ disallowMultipleLineBreaks: true, disallowMultipleVarDecl: true });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });

        it('should not report "excludeFiles" rule as unregistered', function() {
            var error;
            try {
                checker.configure({ excludeFiles: [] });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });
    });

    describe('maxErrors', function() {
        beforeEach(function() {
            checker.configure({
                requireSpaceBeforeBinaryOperators: ['='],
                maxErrors: 1
            });
        });

        it('should allow a maximum number of reported errors to be set', function() {
            var errors = checker.checkString('var foo=1;\n var bar=2;').getErrorList();
            assert(errors.length === 1);
        });

        it('should not report more than the maximum errors across multiple checks', function() {
            var errors = checker.checkString('var foo=1;\n var bar=2;').getErrorList();
            var errors2 = checker.checkString('var baz=1;\n var qux=2;').getErrorList();
            assert(errors.length === 1);
            assert(errors2.length === 0);
        });

        it('should not be used when not a number', function() {
            var errors;
            checker.configure({
                requireSpaceBeforeBinaryOperators: ['='],
                maxErrors: NaN
            });

            errors = checker.checkString('var foo=1;\n var bar=2;').getErrorList();
            assert(errors.length > 0);
        });
    });

    describe('esprima version', function() {
        var customDescription = 'in no way a real error message';
        var customEsprima = {
            parse: function() {
                var error = new Error();
                error.description = customDescription;
                error.lineNumber = 1;
                error.column = 0;

                throw error;
            }
        };

        it('uses a custom esprima when provided to the constructor', function() {
            checker = new Checker({ esprima: customEsprima });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            var error = errors.getErrorList()[0];

            assert(error.rule === 'parseError');
            assert(error.message === customDescription);
        });

        it('uses a custom esprima when both esprima and esnext are provided to the constructor', function() {
            checker = new Checker({ esprima: customEsprima, esnext: true });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            var error = errors.getErrorList()[0];

            assert(error.rule === 'parseError');
            assert(error.message === customDescription);
        });

        it('uses the harmony esprima when true is provided to the constructor', function() {
            checker = new Checker({ esnext: true });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            assert(errors.isEmpty());
        });

        it('uses the harmony esprima when esnext is set to true in the config', function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ esnext: true });

            var errors = checker.checkString('import { foo } from "bar";');
            // Make sure that multiple checks don't fail
            var errors2 = checker.checkString('import { bar } from "foo";');
            assert(errors.isEmpty());
            assert(errors2.isEmpty());
        });

        it('uses the default esprima when falsely or no argument is provided to the constructor', function() {
            checker = new Checker();
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            var error = errors.getErrorList()[0];

            assert(error.rule === 'parseError');
            assert(error.message !== customDescription);
        });
    });

    describe('esprima options', function() {
        var code = 'import { foo } from "bar";';
        var customEsprima = {
            parse: function(code, options) {
                var error = new Error();
                error.description = 'in no way a real error message';
                error.lineNumber = 1;
                error.column = 0;

                throw error;
            }
        };

        beforeEach(function() {
            sinon.spy(customEsprima, 'parse');
        });
        afterEach(function() {
            customEsprima.parse.restore();
        });

        it('sets the "tolerant" esprima option to true by default', function() {
            checker = new Checker({ esprima: customEsprima });
            checker.registerDefaultRules();

            checker.checkString(code);

            assert(customEsprima.parse.calledOnce);
            assert(customEsprima.parse.calledWith(code, {
                tolerant: true,
                loc: true,
                range: true,
                comment: true,
                tokens: true,
                sourceType: 'module'
            }));
        });

        it('allows the "tolerant" esprima option to be overridden', function() {
            checker = new Checker({ esprima: customEsprima });
            checker.registerDefaultRules();
            checker.configure({ esprimaOptions: { tolerant: false } });

            checker.checkString(code);

            assert(customEsprima.parse.calledOnce);
            assert(customEsprima.parse.calledWith(code, {
                tolerant: false,
                loc: true,
                range: true,
                comment: true,
                tokens: true,
                sourceType: 'module'
            }));
        });

        it('uses custom esprima options when set in the config', function() {
            checker = new Checker({ esprima: customEsprima });
            checker.registerDefaultRules();
            checker.configure({ esprimaOptions: { foobar: 'qux', barbaz: 'fred' } });

            checker.checkString(code);

            assert(customEsprima.parse.calledOnce);
            assert(customEsprima.parse.calledWith(code, {
                foobar: 'qux',
                barbaz: 'fred',
                tolerant: true,
                loc: true,
                range: true,
                comment: true,
                tokens: true,
                sourceType: 'module'
            }));
        });

        it('does not override required esprima options', function() {
            checker = new Checker({ esprima: customEsprima });
            checker.registerDefaultRules();
            checker.configure({ esprimaOptions: {
                loc: false,
                range: false,
                comment: false,
                tokens: false,
                sourceType: 'script'
            }});

            checker.checkString(code);

            assert(customEsprima.parse.calledOnce);
            assert(customEsprima.parse.calledWith(code, {
                tolerant: true, // not required
                loc: true,
                range: true,
                comment: true,
                tokens: true,
                sourceType: 'module'
            }));
        });
    });

    describe('error filter', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should accept a path to a filter function to filter out errors', function() {
            checker.configure({
                disallowQuotedKeysInObjects: true,
                errorFilter: __dirname + '/data/error-filter.js'
            });

            var errors = checker.checkString('var x = { "a": 1 }');

            assert.ok(errors.isEmpty());
        });

        it('should not accept a filter function directly in the configuration', function() {
            assert.throws(function() {
                checker.configure({
                    disallowQuotedKeysInObjects: true,
                    errorFilter: function() { return false; }
                });
            });
        });
    });

    describe('presets', function() {
        testPreset('airbnb');
        testPreset('crockford');
        testPreset('google');
        testPreset('grunt');
        testPreset('jquery');
        testPreset('mdcs');
        testPreset('wikimedia');
        testPreset('yandex');

        /**
         * Helper to test a given preset's configuration against its test file
         *
         * Expects the given preset to have a configuration in /presets
         * and real code taken from that project in /test/data/options/preset
         *
         * @example testPreset('google')
         * @param  {String} presetName
         */
        function testPreset(presetName) {
            it('preset ' + presetName + ' should not report any errors from the sample file', function() {
                var checker = new Checker();

                checker.registerDefaultRules();
                checker.configure({
                    preset: presetName
                });

                return checker.checkFile('./test/data/options/preset/' + presetName + '.js').then(function(errors) {
                    assert(errors.isEmpty());
                });
            });
        }
    });
});
