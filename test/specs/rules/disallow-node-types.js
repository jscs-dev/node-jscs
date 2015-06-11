var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-node-types', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowNodeTypes: ['LabeledStatement', 'DebuggerStatement', 'DoWhileStatement'],
            esnext: true
        });
    });

    it('should report on use of LabeledStatement', function() {
        assert(checker.checkString('var f = () => { a: 1 };').getErrorCount() === 1);
        assert(checker.checkString([
            'loop1:',
            'for (i = 0; i < 10; i++) {',
                'if (i === 3) {',
                    'break loop1;',
                '}',
            '}'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should report on use of DebuggerStatement', function() {
        assert(checker.checkString('debugger;').getErrorCount() === 1);
    });

    it('should report on use of DoWhileStatement', function() {
        assert(checker.checkString('do keep(); while (true)').getErrorCount() === 1);
    });

    it('should report on use of another statement', function() {
        assert(checker.checkString('var a = { a: 1 };').isEmpty());
        assert(checker.checkString('var f = () => ({ a: 1 });').isEmpty());
    });
});
