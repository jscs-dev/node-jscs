var StringChecker = require('../../lib/string-checker');
var assert = require('assert');
var sinon = require('sinon');
var fs = require('fs');

describe('modules/string-checker', function() {
    var checker;
    beforeEach(function() {
        checker = new StringChecker();
        checker.registerDefaultRules();
    });

    describe('checkString', function() {
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
                assert.equal(error.line, 1);
                assert.equal(error.column, 19);
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
    });

    describe('configure', function() {
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
    });

    describe('fixString', function() {
        it('should return unfixable errors', function() {
            checker.configure({ disallowImplicitTypeConversion: ['boolean'] });
            var result = checker.fixString('x = !!x;');
            assert.equal(result.errors.getErrorCount(), 1);
            assert.equal(result.errors.getErrorList()[0].message, 'Implicit boolean conversion');
        });

        it('should process parse error', function() {
            checker.configure({});
            var result = checker.fixString('x =');
            assert.equal(result.errors.getErrorCount(), 1);
            assert.equal(result.errors.getErrorList()[0].message, 'Unexpected end of input');
            assert.equal(result.output, 'x =');
        });

        it('should accept file name', function() {
            checker.configure({});
            var result = checker.fixString('x = 1;', '1.js');
            assert.equal(result.errors.getFilename(), '1.js');
        });

        describe('space rules', function() {
            it('should apply fixes to the specified string', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: true });
                var result = checker.fixString('x=1+2;');
                assert(result.errors.isEmpty());
                assert.equal(result.output, 'x =1 +2;');
            });

            it('should apply multiple fixes to the specified string', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: true, requireSpaceAfterBinaryOperators: true });
                var result = checker.fixString('x=1+2;');
                assert(result.errors.isEmpty());
                assert.equal(result.output, 'x = 1 + 2;');
            });
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
            checker = new StringChecker({ esprima: customEsprima });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            var error = errors.getErrorList()[0];

            assert(error.rule === 'parseError');
            assert(error.message === customDescription);
        });

        it('uses a custom esprima when both esprima and esnext are provided to the constructor', function() {
            checker = new StringChecker({ esprima: customEsprima, esnext: true });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            var error = errors.getErrorList()[0];

            assert(error.rule === 'parseError');
            assert(error.message === customDescription);
        });

        it('uses the harmony esprima when true is provided to the constructor', function() {
            checker = new StringChecker({ esnext: true });
            checker.registerDefaultRules();

            var errors = checker.checkString('import { foo } from "bar";');
            assert(errors.isEmpty());
        });

        it('uses the harmony esprima when esnext is set to true in the config', function() {
            checker = new StringChecker();
            checker.registerDefaultRules();
            checker.configure({ esnext: true });

            var errors = checker.checkString('import { foo } from "bar";');
            // Make sure that multiple checks don't fail
            var errors2 = checker.checkString('import { bar } from "foo";');
            assert(errors.isEmpty());
            assert(errors2.isEmpty());
        });

        it('uses the default esprima when falsely or no argument is provided to the constructor', function() {
            checker = new StringChecker();
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
            parse: function() {}
        };

        beforeEach(function() {
            checker = new StringChecker({ esprima: customEsprima });
            checker.registerDefaultRules();

            sinon.spy(customEsprima, 'parse');
        });
        afterEach(function() {
            customEsprima.parse.restore();
        });

        it('sets the "tolerant" esprima option to true by default', function() {
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
            checker = new StringChecker();
            checker.registerDefaultRules();
        });

        it('should accept a path to a filter function to filter out errors', function() {
            checker.configure({
                disallowQuotedKeysInObjects: true,
                errorFilter: require(__dirname + '/../data/error-filter.js')
            });

            var errors = checker.checkString('var x = { "a": 1 }');

            assert.ok(errors.isEmpty());
        });
    });

    describe('throwing rules', function() {
        function _beforeEach(_verbose) {
            checker = new StringChecker({verbose: _verbose});
            // register rule that throw
            checker.registerRule({
                configure : function() {},
                getOptionName: function() { return 'thrower'; },
                check : function() {
                    throw Error('Here we are!');
                }
            });
            checker.configure({thrower: true});
        }

        it('should be handled internally with verbose', function() {
            _beforeEach(true);

            var errs = checker.checkString('var a');
            assert.equal(errs.getErrorCount(), 1);

            var err = errs.getErrorList()[0];
            assert.equal(err.rule, 'thrower');
            assert.ok(err.message.indexOf('Error running rule thrower:') !== -1);
            assert.ok(err.message.indexOf('Error: Here we are!') !== -1);
        });
    });

    describe('presets', function() {
        testPreset('airbnb');
        testPreset('crockford');
        testPreset('google');
        testPreset('grunt');
        testPreset('jquery');
        testPreset('mdcs');
        testPreset('mozilla');
        testPreset('node-style-guide');
        testPreset('wikimedia');
        testPreset('wordpress');
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
                var checker = new StringChecker();

                checker.registerDefaultRules();
                checker.configure({
                    preset: presetName
                });

                var filename = '../data/options/preset/' + presetName + '.js';
                var content = fs.readFileSync(__dirname + '/' + filename, 'utf8');
                assert(checker.checkString(content, filename).isEmpty());
            });
        }
    });
});
