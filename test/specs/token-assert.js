var expect = require('chai').expect;
var sinon = require('sinon');
var esprima = require('esprima');
var JsFile = require('../../lib/js-file');
var TokenAssert = require('../../lib/token-assert');

describe('token-assert', function() {

    function createJsFile(sources) {
        return new JsFile({
            filename: 'example.js',
            source: sources,
            esprima: esprima,
            esprimaOptions: {loc: true, range: true, comment: true, tokens: true}
        });
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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('Missing space between x and =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(!!onError.getCall(0).args[0].message).to.equal(true);
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

            expect(onError).to.have.callCount(0);
        });
    });

    describe('spacesBetween', function() {
        it('should do nothing if either token or nextToken is not specified', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();

            tokenAssert.spacesBetween({
                token: tokens[0],
                exactly: 10
            });

            tokenAssert.spacesBetween({
                nextToken: tokens[0],
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

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('2 spaces required between x and =');
                expect(error.line).to.equal(1);
                expect(error.column).to.equal(1);
            });

            it('should not trigger error on newline between tokens', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on valid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 3
                });

                expect(onError).to.have.callCount(0);
            });

            it('should accept message for invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2,
                    message: 'Custom message'
                });

                expect(onError.getCall(0).args[0].message).to.equal('Custom message');
            });

            it('should error, but not fix, when a comment exists between the two tokens', function() {
                var file = createJsFile('x/*blockcomment*/=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[2],
                    exactly: 5
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.fixed).to.equal(false);
                expect(tokens[2].whitespaceBefore).to.equal('');
            });
        });

        describe('atMost', function() {
            it('should trigger error on invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 1
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('at most 1 spaces required between x and =');
                expect(error.line).to.equal(1);
                expect(error.column).to.equal(1);
            });

            it('should not trigger error on valid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 3
                });

                expect(onError).to.have.callCount(0);
            });

            it('should accept message for invalid space count between tokens', function() {
                var file = createJsFile('x   =   y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.spacesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
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

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                atMost: 1
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('at most 1 spaces required between x and =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
        });

        it('should trigger plural error on invalid maximum space count between tokens', function() {
            var file = createJsFile('x    =    y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                atMost: 2
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('at most 2 spaces required between x and =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
        });

        it('should not trigger error on newline between tokens for maximum spaces', function() {
            var file = createJsFile('x\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                atMost: 1
            });

            expect(onError).to.have.not.callCount(1);
        });

        it('should not trigger error on valid maximum space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
                atMost: 3
            });

            expect(onError).to.have.not.callCount(1);
        });

        it('should accept message for invalid maximum space count between tokens', function() {
            var file = createJsFile('x   =   y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.whitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1],
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

            var tokens = file.getTokens();
            tokenAssert.noWhitespaceBetween({
                token: tokens[0],
                nextToken: tokens[1]
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('Unexpected whitespace between x and =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('Unexpected whitespace between x and =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
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

            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('x and = should be on the same line');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
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

        it('should move tokens instead of collapsing lines when asked.', function() {
            var file = createJsFile('x\n  + y;');

            var tokenAssert = new TokenAssert(file);
            tokenAssert.on('error', function() {}); // do nothing
            var tokens = file.getTokens();

            tokenAssert.sameLine({
                token: tokens[0],
                nextToken: tokens[1],
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

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('x and = should be on different lines');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
        });

        it('should not trigger on additional newlines between tokens', function() {
            var file = createJsFile('x\n\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            expect(onError).to.have.callCount(0);
        });

        it('should not trigger on additional newlines between tokens', function() {
            var file = createJsFile('x\n\n=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.differentLine({
                token: tokens[0],
                nextToken: tokens[1]
            });

            expect(onError).to.have.callCount(0);
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

                this.tokens = file.getTokens();
            });

            it('should throw if no options are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.tokens[0],
                        nextToken: this.tokens[1]
                    });
                }).bind(this)).to.throw(/You must specify at least one option/);
            });

            it('should throw if atLeast and exactly are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.tokens[0],
                        nextToken: this.tokens[1],
                        atLeast: 2,
                        exactly: 1
                    });
                }).bind(this)).to.throw(/You cannot specify atLeast or atMost with exactly/);
            });

            it('should throw if atMost and exactly are specified', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.tokens[0],
                        nextToken: this.tokens[1],
                        atMost: 2,
                        exactly: 1
                    });
                }).bind(this)).to.throw(/You cannot specify atLeast or atMost with exactly/);
            });

            it('should throw if atLeast and atMost are in conflict', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.tokens[0],
                        nextToken: this.tokens[1],
                        atLeast: 3,
                        atMost: 2
                    });
                }).bind(this)).to.throw(/atLeast and atMost are in conflict/);
            });

            it('should throw if token and nextToken are the same', function() {
                expect((function() {
                    this.tokenAssert.linesBetween({
                        token: this.tokens[0],
                        nextToken: this.tokens[0],
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

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('x and = should have exactly 2 line(s) between them');
            });

            it('should trigger error on too many specified newlines', function() {
                var file = createJsFile('x\n\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('x and = should have exactly 2 line(s) between them');
            });

            it('should not trigger error on correct specified newlines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on exactly 0 blank lines', function() {
                var file = createJsFile('x\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 1
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on multiple specified newlines negative', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[1],
                    nextToken: tokens[0],
                    exactly: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('  x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });

            it('should edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('  x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('  x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    exactly: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });

            it('should error, but not fix, when a comment exists between the two tokens', function() {
                var file = createJsFile('x\n//linecomment\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[2],
                    exactly: 5
                });

                expect(onError).to.have.callCount(1);

                var error = onError.getCall(0).args[0];
                expect(error.fixed).to.equal(false);
                expect(tokens[2].whitespaceBefore).to.equal('\n');
            });
        });

        describe('atLeast', function() {
            it('should trigger on too few lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 3
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('x and = should have at least 3 line(s) between them');
            });

            it('should not trigger with exact lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger error on too many lines', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });

            it('should edit the whitespaceBefore with too few lines (spaced then non spaced) between', function() {
                var file = createJsFile('x  \n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 4
                });

                expect(tokens[1].whitespaceBefore).to.equal('  \n\n\n\n  ');
            });

            it('should edit the whitespaceBefore with too few lines (non spaced then spaced) between ', function() {
                var file = createJsFile('x\n  \n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 4
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n  \n\n\n  ');
            });

            it('should not edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });
        });

        describe('atMost', function() {
            it('should not trigger on too few lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should not trigger with exact lines', function() {
                var file = createJsFile('x\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 2
                });

                expect(onError).to.have.callCount(0);
            });

            it('should trigger error on too many lines', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 1
                });

                expect(onError).to.have.callCount(1);
                var error = onError.getCall(0).args[0];
                expect(error.message).to.equal('x and = should have at most 1 line(s) between them');
            });

            it('should not edit the whitespaceBefore with too few lines between', function() {
                var file = createJsFile('x\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n  ');
            });

            it('should edit the whitespaceBefore with too many lines between', function() {
                var file = createJsFile('x\n\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });

            it('should not edit the whitespaceBefore with correct lines between', function() {
                var file = createJsFile('x\n\n  =y;');

                var tokenAssert = new TokenAssert(file);
                tokenAssert.on('error', function() {});

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atMost: 2
                });

                expect(tokens[1].whitespaceBefore).to.equal('\n\n  ');
            });
        });

        describe('between', function() {
            it('should not trigger if within range', function() {
                var file = createJsFile('x\n\n\n=y;');

                var tokenAssert = new TokenAssert(file);
                var onError = sinon.spy();
                tokenAssert.on('error', onError);

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
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

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
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

                var tokens = file.getTokens();
                tokenAssert.linesBetween({
                    token: tokens[0],
                    nextToken: tokens[1],
                    atLeast: 1,
                    atMost: 2
                });

                expect(onError).to.have.callCount(1);
            });
        });
    });

    describe('tokenBefore', function() {
        it('should trigger error on missing token itself before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.tokenBefore({
                token: tokens[0],
                expectedTokenBefore: {value: 'something'}
            });

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('something was expected before x but document start found');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(0);
        });

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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('z was expected before = but x found');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('x (Keyword) was expected before = but x (Identifier) found');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
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
            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });
    });

    describe('noTokenBefore', function() {
        it('should not trigger error on document start before', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            var tokens = file.getTokens();
            tokenAssert.noTokenBefore({
                token: tokens[0],
                expectedTokenBefore: {value: 'something'}
            });

            expect(onError).to.have.callCount(0);
        });

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

            expect(onError).to.have.callCount(1);

            var error = onError.getCall(0).args[0];
            expect(error.message).to.equal('Illegal x was found before =');
            expect(error.line).to.equal(1);
            expect(error.column).to.equal(1);
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

            expect(onError).to.have.callCount(0);
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

            expect(onError).to.have.callCount(0);
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
            expect(onError.getCall(0).args[0].message).to.equal('Custom message');
        });
    });

    describe('indentation', function() {
        it('should not trigger on correct indentation', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
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
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(onError).to.have.not.callCount(0);
        });

        it('with silent option, should not trigger on incorrect indentation', function() {
            var file = createJsFile('  x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' ',
                silent: true
            });

            expect(onError).to.have.callCount(0);
        });

        it('should fix whitespace on incorrect indentation', function() {
            var file = createJsFile('  x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(file.getTokens()[0].whitespaceBefore).to.equal('');
        });

        it('should fix whitespace on incorrect indentation', function() {
            var file = createJsFile('x=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 0,
                expected: 2,
                indentChar: ' '
            });

            expect(file.getTokens()[0].whitespaceBefore).to.equal('  ');
        });

        it('should fix empty line whitespace on incorrect indentation', function() {
            var file = createJsFile('  \n  \nx=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(file.getTokens()[0].whitespaceBefore).to.equal('\n\n');
        });

        it('should fix docblock on incorrect overindentation', function() {
            var file = createJsFile('  /*\n   *\n   */\nx=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            var token = file.getFirstTokenOnLine(1, {includeComments: true});
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(token.whitespaceBefore).to.equal('');
            expect(token.value).to.equal('\n *\n ');
        });

        it('should fix docblock on incorrect underindentation', function() {
            var file = createJsFile('  /*\n   *\n   */\nx=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            var token = file.getFirstTokenOnLine(1, {includeComments: true});
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 4,
                indentChar: ' '
            });

            expect(token.whitespaceBefore).to.equal('    ');
            expect(token.value).to.equal('\n     *\n     ');
        });

        it('should fix whitespace after docblock on incorrect indentation', function() {
            var file = createJsFile('/**/\n  \nx=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            var token = file.getFirstTokenOnLine(3);
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 2,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(token.whitespaceBefore).to.equal('\n\n');
        });

        it('should not lose lines with mixed line endings', function() {
            var file = createJsFile('  \r\n  \r\n  \nx=y;');

            var tokenAssert = new TokenAssert(file);
            var onError = sinon.spy();
            var token = file.getFirstTokenOnLine(4);
            tokenAssert.on('error', onError);

            tokenAssert.indentation({
                lineNumber: 1,
                actual: 2,
                expected: 0,
                indentChar: ' '
            });

            expect(token.whitespaceBefore).to.equal('\r\n\r\n\r\n');
        });
    });
});
