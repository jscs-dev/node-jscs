var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/validate-comment-position', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('accepts valid position', function() {
        var validPositions = [
            'above',
            'beside'
        ];

        validPositions.forEach(function(position) {
            expect(function() {
                checker.configure({ validateCommentPosition: { position: position }});
            }).to.not.throw();
        });
    });

    it('rejects invalid position', function() {
        var invalidPositions = [
            'beneath',
            'under',
            'perpendicular',
            true
        ];

        invalidPositions.forEach(function(position) {
            expect(function() {
                checker.configure({ validateCommentPosition: { position: position }});
            }).to.throw('AssertionError');
        });
    });

    it('accepts valid exceptions', function() {
        expect(function() {
            checker.configure({ validateCommentPosition: { position: 'above', allExcept: ['pragma', 'linter'] }});
        }).to.not.throw();
    });

    it('rejects invalid exceptions', function() {
        var invalidExceptions = [
            [1, 2, 3],
            ['linter', 1, true]
        ];

        invalidExceptions.forEach(function(exception) {
            expect(function() {
                checker.configure({ validateCommentPosition: { position: 'above', allExcept: exception }});
            }).to.throw('AssertionError');
        });
    });

    it('should not accept non-objects', function() {
        expect(function() {
                checker.configure({ validateCommentPosition: 'true' });
            }).to.throw('AssertionError');
    });

    describe('position value "above"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'above' }});
        });

        it('should report on a comment beside a statement', function() {
            expect(checker.checkString('1 + 1; // invalid comment'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });

        it('should not report on a comment above a statement', function() {
            expect(checker.checkString('// valid comment\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on block comments above a statement', function() {
            expect(checker.checkString('/* block comments are skipped */\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on block comments beside a statement', function() {
            expect(checker.checkString('1 + 1; /* block comments are skipped */')).to.have.no.errors();
        });

        it('should not report on eslint inline configurations', function() {
            expect(checker.checkString('1 + 1; /* eslint eqeqeq */')).to.have.no.errors();
        });

        it('should not report on eslint-disable pragma', function() {
            expect(checker.checkString('1 + 1; /* eslint-disable */')).to.have.no.errors();
        });

        it('should not report on eslint-enable pragma', function() {
            expect(checker.checkString('1 + 1; /* eslint-enable */')).to.have.no.errors();
        });

        it('should not report eslint-disable-line pragma', function() {
            expect(checker.checkString('1 + 1; // eslint-disable-line')).to.have.no.errors();
        });

        it('should not report on excepted global variables (eslint)', function() {
            expect(checker.checkString('1 + 1; /* global MY_GLOBAL, ANOTHER */')).to.have.no.errors();
        });

        it('should not report on jshint compatible jslint options', function() {
            expect(checker.checkString('1 + 1; /* jslint vars: true */')).to.have.no.errors();
        });

        it('should not report on excepted global variables (jshint)', function() {
            expect(checker.checkString('1 + 1; /* globals MY_GLOBAL: true */')).to.have.no.errors();
        });

        it('should not report on jshint `exported` directives', function() {
            expect(checker.checkString('1 + 1; /* exported MY_GLOBAL, ANOTHER */')).to.have.no.errors();
        });

        it('should not report on jshint `falls through` directives', function() {
            expect(checker.checkString('1 + 1; /* falls through */')).to.have.no.errors();
        });

        it('should report on comments beginning with words made up of partial keywords', function() {
            expect(checker.checkString('1 + 1; // globalization is a word'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });

        it('should report on comments that mention keywords, but are not valid pragmas', function() {
            expect(checker.checkString('1 + 1; // mentioning falls through'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });

        it('should not report on jshint line comment directives', function() {
            expect(checker.checkString('1 + 1; // jshint ignore:line')).to.have.no.errors();
        });

        it('should not report on istanbul pragmas', function() {
            expect(checker.checkString('1 + 1; /* istanbul ignore next */')).to.have.no.errors();
        });
    });

    describe('position value "above" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'above', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report on comments that start with excepted keywords', function() {
            expect(checker.checkString('1 + 1; // linter excepted comment')).to.have.no.errors();
        });
        it('should still report on comments beside statements after skipping excepted comments', function() {
            expect(checker.checkString('1 + 1; // linter\n2 + 2; // invalid comment'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });
    });

    describe('position value "beside"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'beside' }});
        });

        it('should report on comments above statements', function() {
            expect(checker.checkString('// invalid comment\n1 + 1;'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });

        it('should not report on comments beside statements', function() {
            expect(checker.checkString('1 + 1; // valid comment')).to.have.no.errors();
        });

        it('should not report on inline jscs disable rules', function() {
            expect(checker.checkString('// jscs: disable\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on jscs enable rules', function() {
            expect(checker.checkString('// jscs: enable\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on block comments above statements', function() {
            expect(checker.checkString('/* block comments are skipped */\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on stacked block comments', function() {
            expect(checker.checkString('/*block comment*/\n/*block comment*/\n1 + 1;')).to.have.no.errors();
        });

        it('should not report on block comments beside statements', function() {
            expect(checker.checkString('1 + 1; /* block comment are skipped*/')).to.have.no.errors();
        });

        it('should not report on jshint directives beside statements', function() {
            expect(checker.checkString('1 + 1; // jshint strict: true')).to.have.no.errors();
        });
    });

    describe('position value "beside" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'beside', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report on comments that are above statements that begin with excepted keywords', function() {
            expect(checker.checkString('// pragma valid comment\n1 + 1;')).to.have.no.errors();
        });

        it('should still report on comments that are above statements that follow excepted comments', function() {
            expect(checker.checkString('// pragma\n// invalid\n1 + 1;'))
              .to.have.one.validation.error.from('validateCommentPosition');
        });
    });

});
