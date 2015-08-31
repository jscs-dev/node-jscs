var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-space-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeBlockStatements: true });
    });

    it('should report extra space for control structures', function() {
        expect(checker.checkString('if (true) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('if (true)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('if (true){ var a = false; }')).to.have.no.validation.errors();
    });

    it('should report extra space for control structures with multiple branches', function() {
        expect(
            checker.checkString(
            'if (true) {\n' +
            '    var a = false;\n' +
            '} else {\n' +
            '    var b = false;\n' +
            '}'
            )
        ).to.have.validation.error.count.which.equals(2);

        expect(

            checker.checkString(
            'if (true) {\n' +
            '    var a = false;\n' +
            '}\n' +
            'else{\n' +
            '    var b = false;\n' +
            '}'

            )

        ).to.have.one.validation.error();

        expect(

            checker.checkString(
            'if (true) {\n' +
            '    var a = false;\n' +
            '}\n' +
            'else if (true) {\n' +
            '    var b = false;\n' +
            '}\n' +
            'else{\n' +
            '    var c = false;\n' +
            '}'

            )

        ).to.have.validation.error.count.which.equals(2);

        expect(

            checker.checkString(
            'if (true){\n' +
            '    var a = false;\n' +
            '}\n' +
            'else {\n' +
            '    var b = false;\n' +
            '}'

            )

        ).to.have.one.validation.error();

        expect(

            checker.checkString(
            'if (true){\n' +
            '    var a = false;\n' +
            '}else{\n' +
            '    var b = false;\n' +
            '}'

            )

        ).to.have.validation.error.count.which.equals(0);

        expect(

            checker.checkString(
            'if (true){\n' +
            '    var a = false;\n' +
            '}\n' +
            'else{\n' +
            '    var b = false;\n' +
            '}'

            )

        ).to.have.validation.error.count.which.equals(0);

        expect(

            checker.checkString(
            'if (true){\n' +
            '    var a = false;\n' +
            '} else{\n' +
            '    var b = false;\n' +
            '}'

            )

        ).to.have.validation.error.count.which.equals(0);
    });

    it('should report extra space for loops', function() {
        expect(checker.checkString('while (true) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('while (true)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('while (true){ var a = false; }')).to.have.no.validation.errors();
        expect(checker.checkString('for (var e in es) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('for (var e in es)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('for (var e in es){ var a = false; }')).to.have.no.validation.errors();
    });

    it('should report extra space for function declarations', function() {
        expect(checker.checkString('function foo(i) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('function foo(i){ var a = false; }')).to.have.no.validation.errors();
    });

    it('should not affect object decls', function() {
        expect(checker.checkString('var a ={};')).to.have.no.validation.errors();
        expect(checker.checkString('var a ={id:5};')).to.have.no.validation.errors();
        expect(checker.checkString('var a = {};')).to.have.no.validation.errors();
        expect(checker.checkString('var a = {id:5};')).to.have.no.validation.errors();
    });
});
