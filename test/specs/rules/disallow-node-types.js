var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-node-types', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowNodeTypes: ['LabeledStatement', 'DebuggerStatement', 'DoWhileStatement']
        });
    });

    it('should report on use of LabeledStatement', function() {
        expect(checker.checkString('var f = () => { a: 1 };')).to.have.one.validation.error.from('disallowNodeTypes');
        expect(checker.checkString([
            'loop1:',
            'for (i = 0; i < 10; i++) {',
                'if (i === 3) {',
                    'break loop1;',
                '}',
            '}'
        ].join('\n'))).to.have.one.validation.error.from('disallowNodeTypes');
    });

    it('should report on use of DebuggerStatement', function() {
        expect(checker.checkString('debugger;')).to.have.one.validation.error.from('disallowNodeTypes');
    });

    it('should report on use of DoWhileStatement', function() {
        expect(checker.checkString('do keep(); while (true)')).to.have.one.validation.error.from('disallowNodeTypes');
    });

    it('should report on use of another statement', function() {
        expect(checker.checkString('var a = { a: 1 };')).to.have.no.errors();
        expect(checker.checkString('var f = () => ({ a: 1 });')).to.have.no.errors();
    });
});
