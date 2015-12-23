var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-camelcase-or-uppercase-identifiers', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid configuration', function() {
        it('should report bad prefix values', function() {
            expect(function() {
                checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {allowedPrefixes: [42, 'str']} });
            }).to.throw('AssertionError');
        });
        it('should report bad suffix values', function() {
            expect(function() {
                checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {allowedSuffixes: {}} });
            }).to.throw('AssertionError');
        });
        it('should report bad allExcept values', function() {
            expect(function() {
                checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {allExcept: [/this/, 2]} });
            }).to.throw('AssertionError');
        });
        it('should detect falsy non-string asre elements', function() {
            expect(function() {
                checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {allExcept: [/this/, false]} });
            }).to.throw('AssertionError');
        });
        it('should detect objects not RegExpLiteral', function() {
            expect(function() {
                checker.configure({
                    requireCamelCaseOrUpperCaseIdentifiers: {
                        allExcept: [/this/, {regx: {pattn: ''}}]
                    }
                });
            }).to.throw('AssertionError');
        });
        it('should detect invalid RegExpLiteral objects', function() {
            expect(function() {
                checker.configure({
                    requireCamelCaseOrUpperCaseIdentifiers: {
                        allExcept: [/this/, {regex: {pattern: 'test('}}]
                    }
                });
            }).to.throw('AssertionError');
        });
    });

    describe('option value `true`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: true });
        });

        it('should report inner all-lowercase underscores', function() {
            expect(checker.checkString('var x_y = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report inner some-lowercase underscores', function() {
            expect(checker.checkString('var X_y = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report inner all-uppercase underscores', function() {
            expect(checker.checkString('var X_Y = "x";')).to.have.no.errors();
        });

        it('should not report no underscores', function() {
            expect(checker.checkString('var xy = "x";')).to.have.no.errors();
        });

        it('should not report leading underscores', function() {
            expect(checker.checkString('var _x = "x", __y = "y";')).to.have.no.errors();
        });

        it('should not report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x", y__ = "y";')).to.have.no.errors();
        });

        it('should not report underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report node globals', function() {
            expect(checker.checkString('var a = __dirname + __filename;')).to.have.no.errors();
        });

        it('should report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report object destructring', function() {
            expect(checker.checkString(
                '({camelCase: snake_case, camelCase2: {camelCase3: snake_case2}}) => camelCase.length;'))
              .to.have.validation.errors.from('requireCamelCaseOrUpperCaseIdentifiers');
        });
    });

    describe('option value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: 'ignoreProperties' });
        });

        it('should not report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };')).to.have.no.errors();
        });

        it('should not report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;')).to.have.no.errors();
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report es5 getters', function() {
            expect(checker.checkString('var extend = { get a_b() { } };')).to.have.no.errors();
        });

        it('should not report es5 setters', function() {
            expect(checker.checkString('var extend = { set c_d(v) { } };')).to.have.no.errors();
        });

        it('should not report object destructring', function() {
            expect(checker.checkString(
                '({camelCase: snake_case, camelCase2: {camelCase3: snake_case2}}) => camelCase.length;'))
              .to.have.no.errors();
        });
    });

    describe('option object value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {ignoreProperties: true} });
        });

        it('should not report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };')).to.have.no.errors();
        });

        it('should not report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;')).to.have.no.errors();
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report es5 getters', function() {
            expect(checker.checkString('var extend = { get a_b() { } };')).to.have.no.errors();
        });

        it('should not report es5 setters', function() {
            expect(checker.checkString('var extend = { set c_d(v) { } };')).to.have.no.errors();
        });

        it('should not report object destructring', function() {
            expect(checker.checkString(
                '({camelCase: snake_case, camelCase2: {camelCase3: snake_case2}}) => camelCase.length;'))
              .to.have.no.errors();
        });
    });

    describe('option object value `"strict"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {strict: true} });
        });

        it('should report capital', function() {
            expect(checker.checkString('var X = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report capital word', function() {
            expect(checker.checkString('var Xoe = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report capital used even with second one lower cased', function() {
            expect(checker.checkString('var Xy = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report no capital used', function() {
            expect(checker.checkString('var xy = "x";')).to.have.no.errors();
        });

        it('should not report leading underscores', function() {
            expect(checker.checkString('var _x = "x", __y = "y";')).to.have.no.errors();
        });

        it('should report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x", y__ = "y";')).to.have.no.errors();
        });

        it('should not report underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report node globals', function() {
            expect(checker.checkString('var a = __dirname + __filename;')).to.have.no.errors();
        });

        it('should report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report object properties without capital', function() {
            expect(checker.checkString('var extend = a.snakeCase;')).to.have.no.errors();
        });

        it('should report object properties with capital', function() {
            expect(checker.checkString('var extend = a.SnakeCase;'))
            .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that start with a capital', function() {
            expect(checker.checkString('E'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });
    });

    describe('option object value `"strict"` and `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: {strict: true, ignoreProperties: true} });
        });

        it('should report capital', function() {
            expect(checker.checkString('var X = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report capital word', function() {
            expect(checker.checkString('var Xoe = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report capital used even with second one lower cased', function() {
            expect(checker.checkString('var Xy = "x";'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report no capital used', function() {
            expect(checker.checkString('var xy = "x";')).to.have.no.errors();
        });

        it('should not report leading underscores', function() {
            expect(checker.checkString('var _x = "x", __y = "y";')).to.have.no.errors();
        });

        it('should report trailing underscores', function() {
            expect(checker.checkString('var x_ = "x", y__ = "y";')).to.have.no.errors();
        });

        it('should not report underscore.js', function() {
            expect(checker.checkString('var extend = _.extend;')).to.have.no.errors();
        });

        it('should not report node globals', function() {
            expect(checker.checkString('var a = __dirname + __filename;')).to.have.no.errors();
        });

        it('should not report object keys', function() {
            expect(checker.checkString('var extend = { snake_case: a };')).to.have.no.errors();
        });

        it('should not report object properties', function() {
            expect(checker.checkString('var extend = a.snake_case;')).to.have.no.errors();
        });

        it('should not report object properties without capital', function() {
            expect(checker.checkString('var extend = a.snakeCase;')).to.have.no.errors();
        });

        it('should report object properties with capital', function() {
            expect(checker.checkString('var extend = a.SnakeCase;')).to.have.no.errors();
        });

        it('should report identifiers that are the last token', function() {
            expect(checker.checkString('var a = snake_case'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that are the first token', function() {
            expect(checker.checkString('snake_case = a;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report identifiers that start with a capital', function() {
            expect(checker.checkString('E'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report object destructring', function() {
            expect(checker.checkString(
                '({camelCase: snake_case, camelCase2: {camelCase3: snake_case2}}) => camelCase.length;'))
              .to.have.no.errors();
        });
    });

    describe('option value `{allowedPrefixes: ["opt_", /pfx\d+_/]}`', function() {
        beforeEach(function() {
            checker.configure({
                requireCamelCaseOrUpperCaseIdentifiers: {
                    allowedPrefixes: ['opt_', /pfx\d+_/]
                }
            });
        });

        it('should not report identifiers too short to have a prefix', function() {
            expect(checker.checkString('var id = 0;'))
              .to.have.no.errors();
        });

        it('should report an unrecognized string prefix', function() {
            expect(checker.checkString('var req_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized string prefix', function() {
            expect(checker.checkString('var opt_camelCase = 0;'))
              .to.have.no.errors();
        });

        it('should not report a hidden recognized string prefix', function() {
            expect(checker.checkString('var _opt_camelCase = 0;'))
              .to.have.no.errors();
        });

        it('should report a recognized string not prefix', function() {
            expect(checker.checkString('var xopt_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized RegExp prefix without underscore', function() {
            expect(checker.checkString('var pfx5 = 0;'))
              .to.have.no.errors();
        });

        it('should not report a recognized RegExp prefix', function() {
            expect(checker.checkString('var pfx5_camelCase = 0;'))
              .to.have.no.errors();
        });

        it('should report a recognized RegExp not prefix', function() {
            expect(checker.checkString('var xpfx5_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report a recognized RegExp prefix with trailing garbage', function() {
            expect(checker.checkString('var pfx32x_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

    });

    describe('option value `{allowedPrefixes: ["o_t_", /p_x\d+_/}`', function() {
        beforeEach(function() {
            checker.configure({
                requireCamelCaseOrUpperCaseIdentifiers: {
                    allowedPrefixes: ['o_t_', /p_x\d+_/]
                }
            });
        });

        it('should report an unrecognized string prefix', function() {
            expect(checker.checkString('var r_q_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized string prefix', function() {
            expect(checker.checkString('var o_t_camelCase = 0;'))
              .to.have.no.errors();
        });

        it('should not report a hidden recognized string prefix', function() {
            expect(checker.checkString('var _o_t_camelCase = 0;'))
              .to.have.no.errors();
        });

        it('should report an unrecognized RegExp prefix', function() {
            expect(checker.checkString('var p_x_camelCase = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized RegExp prefix', function() {
            expect(checker.checkString('var p_x32_camelCase = 0;'))
              .to.have.no.errors();
        });
    });

    describe('option value `{allowedSuffixes: ["_dCel", {regex: {pattern: "_[kMG]?Hz"}}]}`', function() {
        beforeEach(function() {
            checker.configure({
                requireCamelCaseOrUpperCaseIdentifiers: {
                    allowedSuffixes: ['_dCel', {regex: {pattern: '_[kMG]?Hz'}}]
                }
            });
        });

        it('should not report identifiers too short to have a suffix', function() {
            expect(checker.checkString('var id = 0;'))
              .to.have.no.errors();
        });

        it('should report an unrecognized string suffix', function() {
            expect(checker.checkString('var temp_Cel = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized string suffix', function() {
            expect(checker.checkString('var temp_dCel = 0;'))
              .to.have.no.errors();
        });

        it('should report an recognized string not suffix', function() {
            expect(checker.checkString('var temp_dCelsius = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report an unrecognized RegExp suffix', function() {
            expect(checker.checkString('var freq_THz = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized RegExp suffix', function() {
            expect(checker.checkString('var freq_Hz = 1;'))
              .to.have.no.errors();
        });

        it('should report an recognized RegExp not suffix', function() {
            expect(checker.checkString('var freq_Hzs = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a RegExp suffix without underscore', function() {
            expect(checker.checkString('var MHz = 1;'))
              .to.have.no.errors();
        });

        it('should not report a string non-suffix', function() {
            expect(checker.checkString('var tempdCel = 0;'))
              .to.have.no.errors();
        });

        it('should not report a RegExp non-suffix', function() {
            expect(checker.checkString('var freqHz = 1;'))
              .to.have.no.errors();
        });

        it('should report an unanchored recognized RegExp suffix that is not a suffix', function() {
            expect(checker.checkString('var freq_MHz3 = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });
    });

    describe('option value `{allowedSuffixes: ["dC_l", {regex: {pattern: "_[kMG]?H_z"}}]}`', function() {
        beforeEach(function() {
            checker.configure({
                requireCamelCaseOrUpperCaseIdentifiers: {
                    allowedSuffixes: ['_dC_l', {regex: {pattern: '_[kMG]?H_z'}}]
                }
            });
        });

        it('should report an unrecognized string suffix', function() {
            expect(checker.checkString('var temp_C_l = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized string suffix', function() {
            expect(checker.checkString('var temp_dC_l = 0;'))
              .to.have.no.errors();
        });

        it('should report an unrecognized RegExp suffix', function() {
            expect(checker.checkString('var freq_TH_z = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a recognized RegExp suffix', function() {
            expect(checker.checkString('var freq_H_z = 1;'))
              .to.have.no.errors();
        });

        it('should report a string non-suffix', function() {
            expect(checker.checkString('var tempdC_l = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report a RegExp non-suffix', function() {
            expect(checker.checkString('var freqH_z = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should report an unanchored recognized RegExp suffix that is not a suffix', function() {
            expect(checker.checkString('var freq_MH_z3 = 1;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });
    });

    describe('option value `{allExcept: ["var_args", {regex: {pattern: "^ignore",flags: "i"}}}`', function() {
        beforeEach(function() {
            checker.configure({
                requireCamelCaseOrUpperCaseIdentifiers: {
                    allExcept: ['var_args', {regex: {pattern: '^ignore', flags: 'i'}}]
                }
            });
        });

        it('should report an unrecognized string near-exception', function() {
            expect(checker.checkString('var var_arg = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a string exception', function() {
            expect(checker.checkString('var var_args = 0;'))
              .to.have.no.errors();
        });

        it('should report an unrecognized RegExp near-exception', function() {
            expect(checker.checkString('var signore_por_favore = 0;'))
              .to.have.one.validation.error.from('requireCamelCaseOrUpperCaseIdentifiers');
        });

        it('should not report a string exception suffix', function() {
            expect(checker.checkString('var ignoreMe_Please = 0;'))
              .to.have.no.errors();
        });
        it('should not report a mixed-case string exception suffix', function() {
            expect(checker.checkString('var iGnOrEMe_Please = 0;'))
              .to.have.no.errors();
        });
    });

});
