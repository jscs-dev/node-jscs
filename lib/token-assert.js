var utils = require('util');
var EventEmitter = require('events').EventEmitter;
var Token = require('cst').Token;

/**
 * Token assertions class.
 *
 * @name {TokenAssert}
 * @param {JsFile} file
 */
function TokenAssert(file) {
    EventEmitter.call(this);

    this._file = file;
}

utils.inherits(TokenAssert, EventEmitter);

/**
 * Requires to have whitespace between specified tokens. Ignores newlines.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Number} [options.spaces] Amount of spaces between tokens.
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.whitespaceBetween = function(options) {
    options.atLeast = 1;
    return this.spacesBetween(options);
};

/**
 * Requires to have no whitespace between specified tokens.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Boolean} [options.disallowNewLine=false]
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.noWhitespaceBetween = function(options) {
    options.exactly = 0;
    return this.spacesBetween(options);
};

/**
 * Requires to have the whitespace between specified tokens with the provided options.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Object} [options.atLeast] At least how many spaces the tokens are apart
 * @param {Object} [options.atMost] At most how many spaces the tokens are apart
 * @param {Object} [options.exactly] Exactly how many spaces the tokens are apart
 * @param {Boolean} [options.disallowNewLine=false]
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.spacesBetween = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    var atLeast = options.atLeast;
    var atMost = options.atMost;
    var exactly = options.exactly;

    if (!token || !nextToken) {
        return false;
    }

    this._validateOptions(options);

    if (!options.disallowNewLine && !this._file.isOnTheSameLine(token, nextToken)) {
        return false;
    }

    // Only attempt to remove or add lines if there are no comments between the two nodes
    // as this prevents accidentally moving a valid token onto a line comment ed line
    var fixed = !options.token.getNextNonWhitespaceToken().isComment;

    var emitError = function(countPrefix, spaceCount) {
        var fix = function() {
            this._file.setWhitespaceBefore(nextToken, new Array(spaceCount + 1).join(' '));
        }.bind(this);

        var msgPostfix = token.value + ' and ' + nextToken.value;

        if (!options.message) {
            if (exactly === 0) {
                // support noWhitespaceBetween
                options.message = 'Unexpected whitespace between ' + msgPostfix;
            } else if (exactly !== undefined) {
                // support whitespaceBetween (spaces option)
                options.message = spaceCount + ' spaces required between ' + msgPostfix;
            } else if (atLeast === 1 && atMost === undefined) {
                // support whitespaceBetween (no spaces option)
                options.message = 'Missing space between ' + msgPostfix;
            } else {
                options.message = countPrefix + ' ' + spaceCount + ' spaces required between ' + msgPostfix;
            }
        }

        this.emit('error', {
            message: options.message,
            element: token,
            offset: token.getSourceCodeLength(),
            fix: fixed ? fix : undefined
        });
    }.bind(this);

    var spacesBetween = this._file.getDistanceBetween(token, nextToken);

    if (atLeast !== undefined && spacesBetween < atLeast) {
        emitError('at least', atLeast);
        return true;
    }

    if (atMost !== undefined && spacesBetween > atMost) {
        emitError('at most', atMost);
        return true;
    }

    if (exactly !== undefined && spacesBetween !== exactly) {
        emitError('exactly', exactly);
        return true;
    }

    return false;
};

/**
 * Requires the specified line to have the expected indentation.
 *
 * @param {Object} options
 * @param {Number} options.actual
 * @param {Number} options.expected
 * @param {String} options.indentChar
 * @param {String} options.token
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.indentation = function(options) {
    var token = options.token;
    var lineNumber = options.lineNumber;
    var actual = options.actual;
    var expected = options.expected;
    var indentChar = options.indentChar;

    if (actual === expected) {
        return false;
    }

    this.emit('error', {
        message: 'Expected indentation of ' + expected + ' characters',
        line: lineNumber,
        column: expected,
        fix: function() {
            var newWhitespace = (new Array(expected + 1)).join(indentChar);

            this._updateWhitespaceByLine(token, function(lines) {
                lines[lines.length - 1] = newWhitespace;
                return lines;
            });

            if (token.isComment) {
                this._updateCommentWhitespace(token, indentChar, actual, expected);
            }
        }.bind(this)
    });

    return true;
};

/**
 * Updates the whitespace of a line by passing split lines to a callback function
 * for editing.
 *
 * @param {Object} token
 * @param {Function} callback
 */
TokenAssert.prototype._updateWhitespaceByLine = function(token, callback) {
    var lineBreak = this._file.getLineBreakStyle();
    var lines = this._file.getWhitespaceBefore(token).split(/\r\n|\r|\n/);

    lines = callback(lines);
    this._file.setWhitespaceBefore(token, lines.join(lineBreak));
};

/**
 * Updates the whitespace of a line by passing split lines to a callback function
 * for editing.
 *
 * @param {Object} token
 * @param {Function} indentChar
 * @param {Number} actual
 * @param {Number} expected
 */
TokenAssert.prototype._updateCommentWhitespace = function(token, indentChar, actual, expected) {
    var difference = expected - actual;
    var tokenLines = token.value.split(/\r\n|\r|\n/);
    var i = 1;
    if (difference >= 0) {
        var lineWhitespace = (new Array(difference + 1)).join(indentChar);
        for (; i < tokenLines.length; i++) {
            tokenLines[i] = tokenLines[i] === '' ? '' : lineWhitespace + tokenLines[i];
        }
    } else {
        for (; i < tokenLines.length; i++) {
            tokenLines[i] = tokenLines[i].substring(-difference);
        }
    }

    var newComment = new Token('CommentBlock', tokenLines.join(this._file.getLineBreakStyle()));
    token.parentElement.replaceChild(newComment, token);
};

/**
 * Requires tokens to be on the same line.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Boolean} [options.stickToPreviousToken]
 * @param {String} [options.message]
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.sameLine = function(options) {
    options.exactly = 0;

    return this.linesBetween(options);
};

/**
 * Requires tokens to be on different lines.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.message]
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.differentLine = function(options) {
    options.atLeast = 1;

    return this.linesBetween(options);
};

/**
 * Requires tokens to have a certain amount of lines between them.
 * Set at least one of atLeast or atMost OR set exactly.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.message]
 * @param {Object} [options.atLeast] At least how many lines the tokens are apart
 * @param {Object} [options.atMost] At most how many lines the tokens are apart
 * @param {Object} [options.exactly] Exactly how many lines the tokens are apart
 * @param {Boolean} [options.stickToPreviousToken] When auto-fixing stick the
 *     nextToken onto the previous token.
 * @return {Boolean} whether an error was found
 */
TokenAssert.prototype.linesBetween = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    var atLeast = options.atLeast;
    var atMost = options.atMost;
    var exactly = options.exactly;

    if (!token || !nextToken) {
        return false;
    }

    this._validateOptions(options);

    // Only attempt to remove or add lines if there are no comments between the two nodes
    // as this prevents accidentally moving a valid token onto a line comment ed line
    var fixed = !options.token.getNextNonWhitespaceToken().isComment;

    var linesBetween = this._file.getLineCountBetween(token, nextToken);

    var emitError = function(countPrefix, lineCount) {
        var msgPrefix = token.value + ' and ' + nextToken.value;

        var fix = function() {
            this._augmentLineCount(options, lineCount);
        }.bind(this);

        if (!options.message) {
            if (exactly === 0) {
                // support sameLine
                options.message = msgPrefix + ' should be on the same line';
            } else if (atLeast === 1 && atMost === undefined) {
                // support differentLine
                options.message = msgPrefix + ' should be on different lines';
            } else {
                // support linesBetween
                options.message = msgPrefix + ' should have ' + countPrefix + ' ' + lineCount + ' line(s) between them';
            }
        }

        this.emit('error', {
            message: options.message,
            element: token,
            offset: token.getSourceCodeLength(),
            fix: fixed ? fix : undefined
        });
    }.bind(this);

    if (atLeast !== undefined && linesBetween < atLeast) {
        emitError('at least', atLeast);
        return true;
    }

    if (atMost !== undefined && linesBetween > atMost) {
        emitError('at most', atMost);
        return true;
    }

    if (exactly !== undefined && linesBetween !== exactly) {
        emitError('exactly', exactly);
        return true;
    }

    return false;
};

/**
 * Throws errors if atLeast, atMost, and exactly options don't mix together properly or
 * if the tokens provided are equivalent.
 *
 * @param {Object} options
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.atLeast] At least how many spaces the tokens are apart
 * @param {Object} [options.atMost] At most how many spaces the tokens are apart
 * @param {Object} [options.exactly] Exactly how many spaces the tokens are apart
 * @throws {Error} If the options are non-sensical
 * @private
 */
TokenAssert.prototype._validateOptions = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    var atLeast = options.atLeast;
    var atMost = options.atMost;
    var exactly = options.exactly;

    if (token === nextToken) {
        throw new Error('You cannot specify the same token as both token and nextToken');
    }

    if (atLeast === undefined &&
        atMost === undefined &&
        exactly === undefined) {
        throw new Error('You must specify at least one option');
    }

    if (exactly !== undefined && (atLeast !== undefined || atMost !== undefined)) {
        throw new Error('You cannot specify atLeast or atMost with exactly');
    }

    if (atLeast !== undefined && atMost !== undefined && atMost < atLeast) {
        throw new Error('atLeast and atMost are in conflict');
    }
};

/**
 * Augments token whitespace to contain the correct number of newlines while preserving indentation
 *
 * @param {Object} options
 * @param {Object} options.nextToken
 * @param {Boolean} [options.stickToPreviousToken]
 * @param {Number} lineCount
 * @private
 */
TokenAssert.prototype._augmentLineCount = function(options, lineCount) {
    var token = options.nextToken;
    if (lineCount === 0) {
        if (options.stickToPreviousToken) {
            var nextToken = this._file.getNextToken(token, {
                includeComments: true
            });
            this._file.setWhitespaceBefore(nextToken, this._file.getWhitespaceBefore(token));
        }

        this._file.setWhitespaceBefore(token, ' ');
        return;
    }

    this._updateWhitespaceByLine(token, function(lines) {
        var currentLineCount = lines.length;
        var lastLine = lines[lines.length - 1];

        if (currentLineCount <= lineCount) {
            // add additional lines that maintain the same indentation as the former last line
            for (; currentLineCount <= lineCount; currentLineCount++) {
                lines[lines.length - 1] = '';
                lines.push(lastLine);
            }
        } else {
            // remove lines and then ensure that the new last line maintains the previous indentation
            lines = lines.slice(0, lineCount + 1);
            lines[lines.length - 1] = lastLine;
        }

        return lines;
    });
};

module.exports = TokenAssert;
