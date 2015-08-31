var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/validate-jsdoc', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not report normal comments directly above functions', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '// a comment\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should not report normal comments a few lines above functions', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '// a comment\n' +
                '\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should report invalid jsdoc if no options provided', function() {
        checker.configure({ validateJSDoc: {} });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should report invalid jsdoc', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.one.validation.error();
    });

    it('should report error in jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} yyy\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.one.validation.error();
    });

    it('should report error in jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} yyy\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.one.validation.error();
    });

    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.no.errors();
    });

    it('should not report redundant jsdoc-param for function if not configured', function() {
        checker.configure({ validateJSDoc: { checkParamNames: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} yyy\n' +
                ' */\n' +
                'function funcName() {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should report redundant jsdoc-param for function', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} yyy\n' +
                ' */\n' +
                'function funcName() {\n' +
                    '\n' +
                '}'
            )
        ).to.have.one.validation.error();
    });

    it('should report redundant jsdoc-param for method', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} yyy\n' +
                '     */\n' +
                '    run: function() {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.one.validation.error();
    });

    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { checkRedundantParams: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.no.errors();
    });

    it('should report missing jsdoc-param type for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.one.validation.error();
    });

    it('should report missing jsdoc-param type for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param yyy\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.one.validation.error();
    });

    it('should not report valid jsdoc for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {String} xxx\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc option property name for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                '/**\n' +
                ' * @param {Object} xxx\n' +
                ' * @param {String} xxx.yyy\n' +
                ' */\n' +
                'function funcName(xxx) {\n' +
                    '\n' +
                '}'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                '    /**\n' +
                '     * @param {String} xxx\n' +
                '     */\n' +
                '    run: function(xxx) {\n' +
                '        \n' +
                '    }\n' +
                '};'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc with object type for method', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'var x = 1;\n' +
                    '/**\n' +
                    ' * @param {{foo: string}} xxx\n' +
                    ' */\n' +
                    'function funcName(xxx) {\n' +
                    '\n' +
                    '}'
            )
        ).to.have.no.errors();
    });

    it('should not report valid jsdoc with object type for function', function() {
        checker.configure({ validateJSDoc: { requireParamTypes: true } });
        expect(
            checker.checkString(
                'Cls.prototype = {\n' +
                    '    /**\n' +
                    '     * @param {{foo: string}} xxx\n' +
                    '     */\n' +
                    '    run: function(xxx) {\n' +
                    '        \n' +
                    '    }\n' +
                    '};'
            )
        ).to.have.no.errors();
    });
});
