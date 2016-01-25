var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-imports-aplhabetized', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireImportAlphabetized: true });
    });

    it('should report no errors when there are no imports', function() {
        var code = '// no imports here;\n' +
            'var looping = function(n) {\n' +
                'var a = 0, b = 1, f = 1;\n' +
                'for(var i = 2; i <= n; i++) {\n' +
                    'f = a + b;\n' +
                    'a = b;\n' +
                    'b = f;\n' +
                '}\n' +
                'return f; \n' +
            '};';

        expect(checker.checkString(code)).to.have.no.errors();
    });

    it('should report no errors for ordered imports', function() {
        var code = 'import A from \'A\';\nimport C from \'C\';\nimport Z from \'Z\';';
        expect(checker.checkString(code)).to.have.no.errors();
    });

    it('should report no errors for ordered import multiline', function() {
        var code = 'import A\n from\n \'A\';\nimport C\n from \'C\';\nimport Z\n from \'Z\';';
        expect(checker.checkString(code)).to.have.no.errors();
    });

    it('should report one error for un-ordered imports', function() {
        var code = 'import A from \'A\';\nimport Z from \'Z\';\nimport B from \'B\';';
        expect(checker.checkString(code)).to.have.one.error();
    });

    it('should report no errors for ordered named imports', function() {
        var code = 'import { A as myNamed1, named2 } from \'src/mylib\';\n' +
        'import { B as myNamed1, named2 } from \'src/mylib\';\n' +
        'import { C as myNamed1, named2 } from \'src/mylib\';';

        expect(checker.checkString(code)).to.have.no.errors();
    });

    it('should report one error for un-ordered named imports', function() {
        var code = 'import { Z as myNamed1, named2 } from \'src/mylib\';\n' +
        'import { B as myNamed1, named2 } from \'src/mylib\';\n' +
        'import { C as myNamed1, named2 } from \'src/mylib\';';

        expect(checker.checkString(code)).to.have.one.error();
    });

    it('should report no errors for ordered module as an object import', function() {
        var code = 'import * from \'src/A\';\n' +
        'import * from \'src/B\';\n' +
        'import * from \'src/C\';';

        expect(checker.checkString(code)).to.have.no.error();
    });

    it('should report one error for un-ordered module as an object import', function() {
        var code = 'import * from \'src/A\';\n' +
        'import * from \'src/Z\';\n' +
        'import * from \'src/C\';';

        expect(checker.checkString(code)).to.have.one.error();
    });

    it('should report no errors for ordered module import', function() {
        var code = 'import \'src/A\';\n' +
        'import \'src/B\';\n' +
        'import \'src/C\';';

        expect(checker.checkString(code)).to.have.no.error();
    });

    it('should report one error for un-ordered module import', function() {
        var code = 'import \'src/Z\';\n import \'src/B\';\nimport \'src/C\';';
        expect(checker.checkString(code)).to.have.one.error();
    });

    it('should report multiple errors for un-ordered module import', function() {
        var code = 'import \'src/C\';\n import \'src/B\';\nimport \'src/A\';';
        expect(checker.checkString(code)).to.have.validation.errors.from('requireImportAlphabetized');
    });
});
