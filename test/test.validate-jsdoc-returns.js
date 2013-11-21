var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/validate-jsdoc', function() {

    describe('returns', function () {

        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should report invalid @returns jsdoc', function() {
            checker.configure({ validateJSDoc: { requireReturnTypes: true } });
            assert(
                checker.checkString(
                    'var x = 1;\n' +
                    '/**\n' +
                    ' * @return' +
                    ' */\n' +
                    'function funcName() {\n' +
                        '\n' +
                    '}'
                ).getErrorCount() === 1
            );
        });

        it('should report redundant @returns for function', function() {
            checker.configure({ validateJSDoc: { checkRedundantReturns: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {string}' +
                    ' */\n' +
                    'function funcName() {\n' +
                        '\n' +
                    '}\n' +

                    '/**\n' +
                    ' * @returns {String}' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'var x = function () { return 1; }\n' +
                    '}\n' +

                    '/**\n' +
                    ' * @returns {String}' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return;\n' +
                    '}'
                ).getErrorCount() === 3
            );
        });

        it('should not report redundant @returns for function', function() {
            checker.configure({ validateJSDoc: { checkRedundantReturns: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @returns {String}' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'var x = function () { return 1; }\n' +
                        'if (true) { return x; }\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should report invalid @returns type in function', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @returns {Object}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return "";\n' +
                    '}'
                ).getErrorCount() === 1
            );
        });

        it('should not report valid jsdoc with object type in method', function() {
            checker.configure({ validateJSDoc: { requireReturnTypes: true } });
            assert(
                checker.checkString(
                    'Cls.prototype = {\n' +
                        '    /**\n' +
                        '     * @return {{bar: number}}\n' +
                        '     */\n' +
                        '    run: function(xxx) {\n' +
                        '        return {};\n' +
                        '    }\n' +
                        '};'
                ).isEmpty()
            );
        });

        it('should not report valid resulting type with object type in method', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    'Cls.prototype = {\n' +
                    '    /**\n' +
                    '     * @return {{bar: number}}\n' +
                    '     */\n' +
                    '    run: function(xxx) {\n' +
                    '        return {};\n' +
                    '    }\n' +
                    '};\n'
                ).isEmpty()
            );
        });
        it('should not report valid resulting type with object type in function', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {Object}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return new Object();\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report comparition jsdoc type to any expression in function', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {Object}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return Object.create();\n' +
                    '}\n' +
                    '/**\n' +
                    ' * @return {string}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return makeMyDay("zxc");\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report valid resulting array type for function', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {Array}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return [1, 2];\n' +
                    '}\n' +
                    '/**\n' +
                    ' * @return {Array}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return new Array("zxc");\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report valid resulting regexp type for function', function() {
            checker.configure({ validateJSDoc: { checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {RegExp}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return /[a-z]+/i;\n' +
                    '}\n' +
                    '/**\n' +
                    ' * @return {RegExp}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return new RegExp("[a-z]+", "i");\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report valid resulting array.<String> and Object[] for function', function () {
            checker.configure({ validateJSDoc: { requireReturnTypes: true, checkReturnTypes: true } });
            assert(
                checker.checkString(
                    '/**\n' +
                    ' * @return {String[]}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return ["a", "b", "c"];\n' +
                    '}\n' +
                    '/**\n' +
                    ' * @return {Object[]}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return [{}, {}];\n' +
                    '}\n' +
                    '/**\n' +
                    ' * @return {Array.<Number>}\n' +
                    ' */\n' +
                    'function funcName() {\n' +
                        'return [1, 2, 3];\n' +
                    '}'
                ).isEmpty()
            );
        });

    });

});
