var expect = require('chai').expect;
var sinon = require('sinon');
var JsFile = require('../../lib/js-file');
var TokenAssert = require('../../lib/token-assert');
var getPosition = require('../../lib/errors').getPosition;

describe('token-assert', function() {

    function createJsFile(sources) {
        return new JsFile({
            filename: 'example.js',
            source: sources
        });
    }

    describe('whitespaceBetween', function() {
        it('should trigger error on missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var first = file.getTree().getFirstToken();

            tokenAssert.whitespaceBetween({
                token: first,
                nextToken: file.getNextToken(first)
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('Missing space between x and =');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should accept message for missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Custom message'
            });

            expect(!!onError.getCall(0).args[0].message).to.equal(true);
        });

        it('should not trigger error on existing whitespace between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });
    });

    describe('spacesBetween', function() {
        it('should do nothing if either token or nextToken is not specified', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();

            tokenAssert.spacesBetween({
                token: token,
                exactly: 10
            });

            tokenAssert.spacesBetween({
                nextToken: token,
                exactly: 10
            });

            expect(onError).to.have.callCount(0);
        });

        describe('exactly', function() {
            it('should trigger error on invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];

                expect(error.message).to.contain('2 spaces required between x and =');
                expect(getPosition(error).line).to.equal(1);
                expect(getPosition(error).column).to.equal(1);
            });

            it('should not trigger error on newline between tokens', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on valid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 3
                });

                expect(onError).to.have.callCount(0);
            });

            it('should accept message for invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2,
                    message: 'Custom message'
                });

                expect(onError.getCall(0).args[0].message).to.equal('Custom message');
            });

            it('should error, but not fix, when a comment exists between the two tokens', function() {
                var file = createJsFile('x/*blockcomment*/=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                var token = file.getTree().getFirstToken();
                var yToken = file.findNextToken(token, 'Identifier', 'y');

                tokenAssert.on('error', onError);

                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: file.findNextToken(token, 'Identifier', 'y'),
                    exactly: 5
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.fix).to.equal(undefined);
                expect(file.getWhitespaceBefore(yToken)).to.equal('');
            });
        });

        describe('atMost', function() {
            it('should trigger error on invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 1
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.message).to.contain('at most 1 spaces required between x and =');
                expect(getPosition(error).line).to.equal(1);
                expect(getPosition(error).column).to.equal(1);
            });

            it('should not trigger error on valid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 3
                });

                expect(onError).to.have.callCount(0);
            });

            it('should accept message for invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.spacesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 1,
                    message: 'Custom message'
                });

                expect(onError.getCall(0).args[0].message).to.equal('Custom message');
            });
        });

        it('should trigger error on invalid maximum space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                atMost: 1
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('at most 1 spaces required between x and =');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should trigger plural error on invalid maximum space count between tokens', function() {
            var file = createJsFile('x    =    y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                atMost: 2
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('at most 2 spaces required between x and =');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should not trigger error on newline between tokens for maximum spaces', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                atMost: 1
            });

            expect(onError).to.have.not.callCount(1);
        });

        it('should not trigger error on valid maximum space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                atMost: 3
            });

            expect(onError).to.have.not.callCount(1);
        });

        it('should accept message for invalid maximum space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.whitespaceBetween({
                token: token,
                nextToken: nextToken,
                atMost: 1,
                message: 'Custom message'
            });

            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });
    });

    describe('noWhitespaceBetween', function() {
        it('should trigger error on existing whitespace between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('Unexpected whitespace between x and =');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should not trigger error on newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should trigger error on newline between tokens with disallowNewLine option', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken,
                disallowNewLine: true
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('Unexpected whitespace between x and =');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should not trigger error on missing whitespace between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should accept message for existing space count between tokens', function() {
            var file = createJsFile('x = y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Custom message'
            });

            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });
    });

    describe('sameLine', function() {
        it('should trigger error on unexpected newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.sameLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('x and = should be on the same line');

            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should not trigger error on missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.sameLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should accept message for unexpected newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.sameLine({
                token: token,
                nextToken: nextToken,
                message: 'Custom message'
            });

            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });

        it('should not throw if token or nextToken properties are undefined', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);

            tokenAssert.sameLine({
                token: undefined,
                nextToken: undefined
            });
        });

        it('should move tokens instead of collapsing lines when asked', function() {
            var file = createJsFile('x\n  + y;');

            var tokenAssert = new TokenAssert(file);
            tokenAssert.on('error', function(errorInfo) {
                errorInfo.fix();
            });
            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '+');
            tokenAssert.sameLine({
                token: token,
                nextToken: nextToken,
                stickToPreviousToken: true
            });

            expect(file.render()).to.equal('x +\n  y;');
        });
    });

    describe('differentLine', function() {
        it('should trigger error on missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.differentLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.contain('x and = should be on different lines');
            expect(getPosition(error).line).to.equal(1);
            expect(getPosition(error).column).to.equal(1);
        });

        it('should not trigger error on existing newline between tokens', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.differentLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should not trigger on additional newlines between tokens', function() {
            var file = createJsFile('x\n\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.differentLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should not trigger on additional newlines between tokens', function() {
            var file = createJsFile('x\n\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.differentLine({
                token: token,
                nextToken: nextToken
            });

            expect(onError).to.have.callCount(0);
        });

        it('should accept message for missing newline between tokens', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var token = file.getTree().getFirstToken();
            var nextToken = file.findNextToken(token, 'Punctuator', '=');
            tokenAssert.differentLine({
                token: token,
                nextToken: nextToken,
                message: 'Custom message'
            });

            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });

        it('should not throw if token or nextToken properties are undefined', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);

            tokenAssert.differentLine({
                token: undefined,
                nextToken: undefined
            });
        });
    });

    describe('linesBetween', function() {
        describe('error messages', function() {
            beforeEach(function() {
                var file = createJsFile('x=y;');

                this.tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                this.tokenAssert.on('error', onError);

                this.firstToken = file.getTree().getFirstToken();
                this.secondToken = this.firstToken.getNextCodeToken();
            });

            it('should throw if no options are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.firstToken,
                        nextToken: this.secondToken
                    });
                }).bind(this)).to.throw(/You must specify at least one option/);
            });

            it('should throw if atLeast and exactly are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.firstToken,
                        nextToken: this.secondToken,
                        atLeast: 2,
                        exactly: 1
                    });
                }).bind(this)).to.throw(/You cannot specify atLeast or atMost with exactly/);
            });

            it('should throw if atMost and exactly are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.firstToken,
                        nextToken: this.secondToken,
                        atMost: 2,
                        exactly: 1
                    });
                }).bind(this)).to.throw(/You cannot specify atLeast or atMost with exactly/);
            });

            it('should throw if atLeast and atMost are in conflict', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.firstToken,
                        nextToken: this.secondToken,
                        atLeast: 3,
                        atMost: 2
                    });
                }).bind(this)).to.throw(/atLeast and atMost are in conflict/);
            });

            it('should throw if token and nextToken are the same', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.firstToken,
                        nextToken: this.firstToken,
                        atLeast: 1
                    });
                }).bind(this))
                  .to.throw(/You cannot specify the same token as both token and nextToken/);
            });
        });

        it('should not throw if token or nextToken properties are undefined', function() {
            var file = createJsFile('x\n=y;');
            var tokenAssert = new TokenAssert(file);

            tokenAssert.linesBetween({
                token: undefined,
                nextToken: undefined,
                exactly: 1
            });
        });

        describe('exactly', function() {
            it('should trigger error on too few newlines', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.message).to.contain('x and = should have exactly 2 line(s) between them');
            });

            it('should trigger error on too many specified newlines', function() {
                var file = createJsFile('x\n\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.contain('x and = should have exactly 2 line(s) between them');
            });

            it('should not trigger error on correct specified newlines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on exactly 0 blank lines', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 1
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on multiple specified newlines negative', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var lastToken = file.getLastToken();
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: lastToken,
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('  x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.findNextToken(
                    file.getTree().getFirstToken(),
                    'Identifier'
                );
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(file.getWhitespaceBefore(nextToken)).to.equal('\n\n  ');
            });

            it('should edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('  x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(file.getWhitespaceBefore(nextToken)).to.equal('\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('  x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 2
                });

                expect(file.getWhitespaceBefore(nextToken)).to.equal('\n\n  ');
            });

            it('should error, but not fix, when a comment exists between the two tokens (with newline)', function() {
                var file = createJsFile('x\n//linecomment\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    exactly: 5
                });

                expect(onError).to.have.callCount(1);

                expect(file.getWhitespaceBefore(nextToken)).to.equal('\n');
            });
        });

        describe('atLeast', function() {
            it('should trigger on too few lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 3
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.contain('x and = should have at least 3 line(s) between them');
            });

            it('should not trigger with exact lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on too many lines', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n\n  ');
            });

            it('should edit the whitespaceBefore with too few lines (spaced then non spaced) between', function() {
                var file = createJsFile('x  \n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 4
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('  \n\n\n\n  ');
            });

            it('should edit the whitespaceBefore with too few lines (non spaced then spaced) between ', function() {
                var file = createJsFile('x\n  \n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 4
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n  \n\n\n  ');
            });

            it('should not edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n\n  ');
            });
        });

        describe('atMost', function() {
            it('should not trigger on too few lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger with exact lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should trigger error on too many lines', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 1
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.contain('x and = should have at most 1 line(s) between them');
            });

            it('should not edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n  ');
            });

            it('should edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function(errorInfo) {
                    errorInfo.fix();
                });

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atMost: 2
                });

                expect(file.getWhitespaceBefore(file.getNextToken(token))).to.equal('\n\n  ');
            });
        });

        describe('between', function() {
            it('should not trigger if within range', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 1,
                    atMost: 3
                });

                expect(onError).to.have.callCount(0);
            });

            it('should trigger if below range', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 2,
                    atMost: 3
                });

                expect(onError).to.have.callCount(1);
            });

            it('should trigger if above range', function() {
                var file = createJsFile('x\n\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var token = file.getTree().getFirstToken();
                var nextToken = file.findNextToken(token, 'Punctuator', '=');
                tokenAssert.linesBetween({
                    token: token,
                    nextToken: nextToken,
                    atLeast: 1,
                    atMost: 2
                });

                expect(onError).to.have.callCount(1);
            });
        });
    });

    describe('indentation', function() {
        it('should not trigger on correct indentation', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                token: file.getProgram().getFirstToken(),
                actual: 0,
                expected: 0,
                indentChar: ' '
            });

            expect(onError).to.have.callCount(0);
        });

        it('should trigger on incorrect indentation', function() {
            var file = createJsFile('  x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                token: file.getProgram().getFirstToken().getNextCodeToken(),
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(onError).to.have.not.callCount(0);
        });

        it('should fix whitespace on incorrect indentation for the first token', function() {
            var file = createJsFile('  x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                token: file.getProgram().getFirstToken().getNextCodeToken(),
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(file.getWhitespaceBefore(file.getFirstToken())).to.equal('');
        });

        it('should fix docblock on incorrect overindentation', function() {
            var file = createJsFile('  /*\n   *\n   */\nx=y;');

            var tokenAssert = new TokenAssert(file);
            tokenAssert.on('error', function(errorInfo) {
                errorInfo.fix();
            });

            var comment = file.getProgram().getFirstToken().getNextNonWhitespaceToken();
            tokenAssert.indentation({
                token: comment,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            comment = file.getProgram().getFirstToken();
            expect(file.getWhitespaceBefore(comment)).to.equal('');
            expect(comment.value).to.equal('\n *\n ');
        });

        it('should fix docblock on incorrect underindentation', function() {
            var file = createJsFile('  /*\n   *\n   */\nx=y;');

            var tokenAssert = new TokenAssert(file);
            tokenAssert.on('error', function(errorInfo) {
                errorInfo.fix();
            });

            var comment = file.getProgram().getFirstToken().getNextNonWhitespaceToken();
            tokenAssert.indentation({
                token: comment,
                actual: 2,
                expected: 4,
                indentChar: ' '
            });

            comment = file.getProgram().getFirstToken().getNextNonWhitespaceToken();
            expect(file.getWhitespaceBefore(comment)).to.equal('    ');
            expect(comment.value).to.equal('\n     *\n     ');
        });
    });
});
