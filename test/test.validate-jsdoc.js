var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/validate-jsdoc', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report invalid jsdoc', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report error in jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} yyy\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report error in jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} yyy\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).getErrorCount() === 1
        );
    });
    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).isEmpty()
        );
    });
    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).isEmpty()
        );
    });

    it('should report redundant jsdoc-param for function', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} yyy\n' +
                ' */\n' +
                'function funcName() {\n' +
                    '\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report redundant jsdoc-param for method', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} yyy\n' +
                '     */\n' +
                '    run: function() {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).getErrorCount() === 1
        );
    });
    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).isEmpty()
        );
    });
    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).isEmpty()
        );
    });

    it('should report missing jsdoc-param type for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report missing jsdoc-param type for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param yyy\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).getErrorCount() === 1
        );
    });
    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            ).isEmpty()
        );
    });
    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            ).isEmpty()
        );
    });
    it('should not report valid jsdoc with object type for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'var x = 1;\n' +
                    '/**\n' +
                    ' * @param {{foo: string}} xxx\n' +
                    ' */\n' +
                    'function funcName(xxx) {\n' +
                    '\n' +
                    '}'
            ).isEmpty()
        );
    });
    it('should not report valid jsdoc with object type for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        assert(
            checker.checkString(
                'Cls.prototype = {\n' +
                    '    /**\n' +
                    '     * @param {{foo: string}} xxx\n' +
                    '     */\n' +
                    '    run: function(xxx) {\n' +
                    '        \n' +
                    '    }\n' +
                    '};'
            ).isEmpty()
        );
    });
});
