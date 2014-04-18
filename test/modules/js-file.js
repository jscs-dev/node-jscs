var assert = require('assert');
var esprima = require('esprima');
var JsFile = require('../../lib/js-file');

describe('lib/js-file', function() {
    it('should fix token array for object keys', function() {
        var str = '({ for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for object keys with multiple keys', function() {
        var str = '({ test: 1, for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for method calls', function() {
        var str = 'promise.catch()';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should not affect valid nested constructions', function() {
        var str = 'if (true) { if (false); }';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            if (token.value === 'if') {
                assert(token.type === 'Keyword');
            }
        });
    });
});
