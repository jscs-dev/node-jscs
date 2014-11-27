var assert = require('assert');
var sinon = require('sinon');
var esprima = require('esprima');
var JsFile = require('../lib/js-file');
var TokenAssert = require('../lib/token-assert');

describe('modules/token-assert', function() {

    function createJsFile(sources) {
        return new JsFile(
            'example.js',
            sources,
            esprima.parse(sources, {loc: true, range: true, comment: true, tokens: true})
        );
    }

    describe('whitespaceBetween', function() {
        it('should trigger error on missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'Missing space between x and =');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should accept message for missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                message: 'Custom message'
            });

            assert(onError.getCall(0).args[0].message, 'Custom message');
        });

        it('should not trigger error on existing whitespace between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(!onError.calledOnce);
        });

        it('should trigger error on invalid space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                spaces: 2
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, '2 spaces required between x and =');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                spaces: 2
            });

            assert(!onError.calledOnce);
        });

        it('should not trigger error on valid space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                spaces: 3
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for invalid space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                spaces: 2,
                message: 'Custom message'
            });

            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });

    describe('noWhitespaceBetween', function() {
        it('should trigger error on existing whitespace between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'Unexpected whitespace between x and =');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(!onError.calledOnce);
        });

        it('should trigger error on newline between tokens with disallowNewLine option', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                disallowNewLine: true
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'Unexpected whitespace between x and =');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for existing space count between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                message: 'Custom message'
            });

            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });

    describe('sameLine', function() {
        it('should trigger error on unexpected newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.sameLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'x and = should be on the same line');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.sameLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for unexpected newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.sameLine({
                token: tokens[0],
                nextToken: tokens[1],
                message: 'Custom message'
            });

            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });

    describe('differentLine', function() {
        it('should trigger error on missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'x and = should be on different lines');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on existing newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1],
                message: 'Custom message'
            });

            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });

    describe('tokenBefore', function() {
        it('should trigger error on missing token value before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.tokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'z'
                }
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'z was expected before = but x found');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should trigger error on missing token type before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.tokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Keyword',
                    value: 'x'
                }
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'x (Keyword) was expected before = but x (Identifier) found');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on correct token before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.tokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'x'
                }
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for missing token before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.tokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'z'
                },
                message: 'Custom message'
            });
            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });

    describe('noTokenBefore', function() {
        it('should trigger error on illegal token value before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noTokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'x'
                }
            });

            assert(onError.calledOnce);

            var error = onError.getCall(0).args[0];
            assert.equal(error.message, 'Illegal x was found before =');
            assert.equal(error.line, 1);
            assert.equal(error.column, 1);
        });

        it('should not trigger error on missing token value before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noTokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'z'
                }
            });

            assert(!onError.calledOnce);
        });

        it('should not trigger error on missing token type before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noTokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Keyword',
                    value: 'x'
                }
            });

            assert(!onError.calledOnce);
        });

        it('should accept message for illegal token before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noTokenBefore({
                token: tokens[1],
                expectedTokenBefore: {
                    type: 'Identifier',
                    value: 'x'
                },
                message: 'Custom message'
            });
            assert.equal(onError.getCall(0).args[0].message, 'Custom message');
        });
    });
});
