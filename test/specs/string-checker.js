var fs = require('fs');

var expect = require('chai').expect;
var sinon = require('sinon');

var StringChecker = require('../../lib/string-checker');
var Errors = require('../../lib/errors');

describe('string-checker', function() {
    var checker;
    beforeEach(function() {
        checker = new StringChecker();
        checker.registerDefaultRules();
    });

    describe('checkString', function() {
        describe('line starting with hash', function() {
            it('should provide correct data for syntax error', function() {
                var error = checker.checkString(
                    'function () {}'
                ).getErrorList()[0];

                expect(error).to.have.deep.equal({
                    filename: 'input',
                    rule: 'parseError',
                    message: 'Unexpected token (1:9)',
                    line: 1,
                    column: 9
                });
            });

            it('should ignore lines starting with #!', function() {
                expect(checker.checkString(
                    '#! random stuff\n' +
                    '#! 1234\n' +
                    'var a = 5;\n'
                )).to.have.no.errors();
            });

            it('should ignore ios instruments style import', function() {
                expect(checker.checkString(
                    '#import "abc.js"\n' +
                    '#import abc.js\n' +
                    'var a = 5;\n'
                )).to.have.no.errors();
            });

            it('should not replace when not beginning of line', function() {
                checker.configure({ disallowMultipleLineStrings: true });
                expect(checker.checkString(
                    '#import "abc.js"\n' +
                    'var b="#import \\\n abc.js";\n' +
                    'var a = 5;\n'
                )).to.have.one.error();
            });

            it('should report error in the correct location when first line starts with #!', function() {
                checker.configure({ disallowMultipleLineBreaks: true });
                var error = checker.checkString('#!/usr/bin/env node\n\n\nx = 1;').getErrorList()[0];
                expect(error.line).to.equal(1);
                expect(error.column).to.equal(19);
            });
        });

        it('should not check empty string (#1354)', function() {
            var spy = sinon.spy(StringChecker.prototype, '_checkJsFile');

            expect(checker.checkString('')).to.have.no.errors();

            expect(spy.called).to.equal(false);
            spy.restore();
        });

        it('should report parse issues as errors', function() {
            var errors = checker.checkString('this is not javascript');
            expect(errors).to.have.one.error();

            var error = errors.getErrorList()[0];
            expect(error.rule).to.equal('parseError');
            expect(error.message).to.equal('Unexpected token (1:5)');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(5);
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
                expect(errors.length).to.equal(1);
            });

            it('should not report more than the maximum errors across multiple checks', function() {
                var errors = checker.checkString('var foo=1;\n var bar=2;').getErrorList();
                var errors2 = checker.checkString('var baz=1;\n var qux=2;').getErrorList();
                expect(errors.length).to.equal(1);
                expect(errors2.length).to.equal(0);
            });

            it('should not be used when it is nullified', function() {
                var errors;
                checker.configure({
                    requireSpaceBeforeBinaryOperators: ['='],
                    maxErrors: null
                });

                errors = checker.checkString('var foo=1;\n var bar=2;').getErrorList();
                expect(errors.length).to.be.above(0);
            });

            it('should disable max error check for `-1` value', function() {
                checker.configure({
                    disallowKeywords: ['with'],
                    maxErrors: -1
                });

                var str = new Array(100).join('with({}){}');

                checker.checkString(str);
                expect(checker.maxErrorsExceeded()).to.equal(false);
            });

            it('should disable max error check for `null` value', function() {
                checker.configure({
                    disallowKeywords: ['with'],
                    maxErrors: null
                });

                var str = new Array(100).join('with({}){}');

                checker.checkString(str);
                expect(checker.maxErrorsExceeded()).to.equal(false);
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
            } catch (_) {
                throw new Error();
            }
        });

        it('should throw if preset does not exist', function() {
            try {
                checker.configure({
                    preset: 'not-exist'
                });

                throw new Error();
            } catch (e) {
                expect(e.toString()).to.equal('AssertionError: Preset "not-exist" does not exist');
            }
        });

        describe('rules registration', function() {
            it('should report rules in config which don\'t match any registered rules', function() {
                checker.configure({ doesNotExist: true, noSuchRule: true });
                var errors = checker.checkString('var foo = 1;').getErrorList();

                expect(errors.length).to.equal(2);
                expect(errors[0].message).to.equal('Unsupported rule: doesNotExist');
                expect(errors[1].message).to.equal('Unsupported rule: noSuchRule');
            });

            it('should not report rules in config which match registered rules', function() {
                var error;
                try {
                    checker.configure({ disallowMultipleLineBreaks: true, disallowMultipleVarDecl: true });
                } catch (e) {
                    error = e;
                }
                expect(error).to.equal(undefined);
            });

            it('should not report "excludeFiles" rule as unregistered', function() {
                var error;
                try {
                    checker.configure({ excludeFiles: [] });
                } catch (e) {
                    error = e;
                }
                expect(error).to.equal(undefined);
            });
        });
    });

    describe('fixString', function() {
        it('should return unfixable errors', function() {
            checker.configure({ disallowImplicitTypeConversion: ['boolean'] });
            var result = checker.fixString('x = !!x;');
            expect(result.errors).to.have.one.error();
            expect(result.errors.getErrorList()[0].message)
                .to.equal('disallowImplicitTypeConversion: Implicit boolean conversion');
        });

        it('should process parse error', function() {
            checker.configure({});
            var result = checker.fixString('x =');
            expect(result.errors).to.have.one.error();
            expect(result.errors.getErrorList()[0].message).to.equal('Unexpected token (1:3)');
            expect(result.output).to.equal('x =');
        });

        it('should accept file name', function() {
            checker.configure({});
            var result = checker.fixString('x = 1;', '1.js');
            expect(result.errors.getFilename()).to.equal('1.js');
        });

        describe('space rules', function() {
            it('should apply fixes to the specified string', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: true });
                var result = checker.fixString('x=1+2;');
                expect(result.errors).to.have.no.errors();
                expect(result.output).to.equal('x =1 +2;');
            });

            it('should apply multiple fixes to the specified string', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: true, requireSpaceAfterBinaryOperators: true });
                var result = checker.fixString('x=1+2;');
                expect(result.errors).to.have.no.errors();
                expect(result.output).to.equal('x = 1 + 2;');
            });
        });

        describe('rules with "_fix" field', function() {
            it('should call "_fix" method', function() {
                var err;
                var called = false;
                checker = new StringChecker();

                checker.registerRule({
                    configure: function() {},
                    getOptionName: function() { return 'fixRule'; },
                    check: function(file, errors) {
                        errors.cast({
                            line: 1,
                            column: 2,
                            additional: 'test'
                        });
                    },
                    _fix: function(file, error) {
                        called = true;
                        err = error;
                        expect(error.additional).to.equal('test');
                    }
                });
                checker.configure({fixRule: true});

                checker.fixString('test');
                expect(!!err.fixed).to.equal(true);
                expect(!!called).to.equal(true);
            });

            it('should not try to call "_fix" method if it does not exist', function() {
                checker = new StringChecker();

                checker.registerRule({
                    configure: function() {},
                    getOptionName: function() { return 'fixRule'; },
                    check: function(file, errors) {
                        errors.cast({
                            line: 1,
                            column: 2,
                            additinal: 'test'
                        });
                    }
                });
                checker.configure({fixRule: true});

                try {
                    checker.fixString('test');
                } catch (e) {
                    throw new Error();
                }
            });

            it('should add error if "_fix" call field throws', function() {
                var spy = sinon.spy(Errors.prototype, 'add');

                checker = new StringChecker();

                checker.registerRule({
                    configure: function() {},
                    getOptionName: function() { return 'fixRule'; },
                    check: function(file, errors) {
                        errors.cast({
                            line: 1,
                            column: 2,
                            additinal: 'test'
                        });
                    },
                    _fix: function() {
                        throw new Error('test');
                    }
                });
                checker.configure({fixRule: true});

                try {
                    checker.fixString('test');
                } catch (e) {
                    throw new Error();
                }

                expect(spy).to.have.not.callCount(0);
                expect(spy.args[0][0].indexOf('Error running rule')).to.be.above(-1);
            });

            it('should allow rule to reset error.fixed property', function() {
                var err;
                checker = new StringChecker();

                checker.registerRule({
                    configure: function() {},
                    getOptionName: function() { return 'fixRule'; },
                    check: function(file, errors) {
                        errors.cast({
                            line: 1,
                            column: 2,
                            additinal: 'test'
                        });
                    },
                    _fix: function(error) {
                        err = error;

                        error.fixed = false;
                    }
                });
                checker.configure({fixRule: true});

                checker.fixString('test');

                expect(!err.fixed).to.equal(true);
            });
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
                errorFilter: require(__dirname + '/../data/error-filter/index.js')
            });

            var errors = checker.checkString('var x = { "a": 1 }');

            expect(errors).to.have.no.errors();
        });
    });

    describe('throwing rules', function() {
        function _beforeEach(_verbose) {
            checker = new StringChecker({verbose: _verbose});
            // register rule that throw
            checker.registerRule({
                configure: function() {},
                getOptionName: function() { return 'thrower'; },
                check: function() {
                    throw Error('Here we are!');
                }
            });
            checker.configure({thrower: true});
        }

        it('should be handled internally with verbose', function() {
            _beforeEach(true);

            var errs = checker.checkString('var a');
            expect(errs).to.have.one.error();

            var err = errs.getErrorList()[0];
            expect(err.rule).to.equal('internalError');
            expect(err.message.indexOf('Error running rule thrower:')).to.not.equal(-1);
            expect(err.message.indexOf('Error: Here we are!')).to.not.equal(-1);
        });
    });

    describe('presets', function() {
        this.timeout(30000);

        testPreset('airbnb');
        testPreset('crockford');
        testPreset('google');
        testPreset('grunt');
        testPreset('idiomatic');
        testPreset('jquery');
        testPreset('mdcs');
        testPreset('node-style-guide');
        testPreset('wordpress');

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
            it(presetName + ' should not report any errors from the sample file', function() {
                var checker = new StringChecker();

                checker.registerDefaultRules();
                checker.configure({
                    preset: presetName
                });

                var filename = '../data/options/preset/' + presetName + '.js';
                var content = fs.readFileSync(__dirname + '/' + filename, 'utf8');
                expect(checker.checkString(content, filename)).to.have.no.errors();
            });
        }
    });
});
