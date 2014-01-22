var assert = require('assert');
var esprima = require('esprima');
var JsFile = require('../lib/js-file');

describe('lib/js-file', function() {
    it('should fix token array for object keys', function() {
        var str = '({ for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for object keys with multiple keys', function() {
        var str = '({ test: 1, for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for method calls', function() {
        var str = 'promise.catch()';
        var file = new JsFile(null, str, esprima.parse(str, {tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });
});
