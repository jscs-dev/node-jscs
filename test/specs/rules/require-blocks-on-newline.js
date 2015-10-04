var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-blocks-on-newline', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('configure', function() {
        it('should not report an error for value "true"', function() {
            expect(function() {
                checker.configure({ requireBlocksOnNewline: true });
            }).to.not.throw();
        });

        it('should not report an error for number value 1', function() {
            expect(function() {
                checker.configure({ requireBlocksOnNewline: 1 });
            }).to.not.throw();
        });

        it('should not report an error for object with property includeComments value true', function() {
            expect(function() {
                checker.configure({ requireBlocksOnNewline: {
                    includeComments: true
                }});
            }).to.not.throw();
        });

        it('should not report an error for object with property includeComments value true and minLines 1',
            function() {
                expect(function() {
                        checker.configure({ requireBlocksOnNewline: { includeComments: true, minLines: 1 } });
                    }).to.not.throw();
            }
        );

        it('should report an error for value "-1"', function() {
            expect(function() {
                checker.configure({ requireBlocksOnNewline: -1 });
            }).to.throw();
        });

        it('should report error for object with property includeComments value false', function() {
            expect(function() {
                checker.configure({ requireBlocksOnNewline: {
                    includeComments: false
                }});
            }).to.throw();
        });
    });

    it('should report an error for object with property includeComments value true ' +
        'and a non integer minLines value', function() {
            expect(function() {
                    checker.configure({ requireBlocksOnNewline: { includeComments: true, minLines: true } });
                }).to.throw();
        }
    );

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: true });
        });

        it('should report missing newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();\n}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should not report missing newline for comments after opening brace', function() {
            expect(checker.checkString('if (true) {//comments\n}')).to.have.no.errors();
        });
        it('should report missing newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should not report missing newline for comments before closing brace', function() {
            expect(checker.checkString('if (true) {\n/*comments*/}')).to.have.no.errors();
        });
        it('should report missing newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();}')).to.have.error.count.equal(2);
        });
        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\nabc();\n}')).to.have.no.errors();
        });
        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });
        it('should not report missing newline for comments before block', function() {
            expect(checker.checkString('function a() {\n//comments\nif (true) {\nabc();\n}\n};')).to.have.no.errors();
        });
        it('should not report missing newline for comments after block', function() {
            expect(checker.checkString('function a() {\nif (true) {\nabc();\n}//comments\n};')).to.have.no.errors();
        });
    });

    describe('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: 1 });
        });

        it('should report missing newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();abc();\n}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should report missing newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();abc();}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should report missing newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();abc();}')).to.have.error.count.equal(2);
        });
        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\nabc();abc();\n}')).to.have.no.errors();
        });
        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });
        it('should not report single statement functions', function() {
            expect(checker.checkString('var a = function() {abc();};')).to.have.no.errors();
        });
    });

    describe('option object includeComments true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: {
                includeComments: true
            }});
        });

        it('should report missing newline for comments after opening brace', function() {
            expect(checker.checkString('if (true) {//comments\n}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should report missing newline for comments before closing brace', function() {
            expect(checker.checkString('if (true) {\n/*comments*/}'))
              .to.have.one.validation.error.from('requireBlocksOnNewline');
        });
        it('should not report comments before empty function definitions', function() {
            expect(checker.checkString('if (true) {\n//comments\nvar a = function() {};\n}')).to.have.no.errors();
        });
    });
});
