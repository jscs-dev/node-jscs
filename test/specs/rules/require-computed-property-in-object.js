var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-computed-property-in-object', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireComputedPropertyInObject: true });
    });

    it('should report a dynamic property assignment not at object creation', function() {
        assert(checker.checkString('const obj = {}; obj[getKey(\'enabled\')] = true;').getErrorCount() === 1);
    });

    it('should not report a computed property', function() {
        assert(checker.checkString('const obj = { [getKey(\'enabled\')]: true };').isEmpty());
    });
});
