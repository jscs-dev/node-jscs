var utils = require('util');
var EventEmitter = require('events').EventEmitter;

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
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Number} [options.spaces] Amount of spaces between tokens.
 */
TokenAssert.prototype.whitespaceBetween = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    if (options.hasOwnProperty('spaces')) {
        var spaces = options.spaces;
        if (nextToken.loc.start.line === token.loc.end.line &&
            (nextToken.loc.start.column - token.loc.end.column) !== spaces
        ) {
            this.emit('error', {
                message: options.message ||
                    spaces + ' spaces required between ' + token.value + ' and ' + nextToken.value,
                line: token.loc.end.line,
                column: token.loc.end.column
            });
        }
    } else {
        if (nextToken.range[0] === token.range[1]) {
            this.emit('error', {
                message: options.message || 'Missing space between ' + token.value + ' and ' + nextToken.value,
                line: token.loc.end.line,
                column: token.loc.end.column
            });
        }
    }
};

/**
 * Requires to have no whitespace between specified tokens.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Boolean} [options.disallowNewLine=false]
 */
TokenAssert.prototype.noWhitespaceBetween = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    if (nextToken.range[0] !== token.range[1] &&
        (options.disallowNewLine || token.loc.end.line === nextToken.loc.start.line)
    ) {
        this.emit('error', {
            message: options.message || 'Unexpected whitespace between ' + token.value + ' and ' + nextToken.value,
            line: token.loc.end.line,
            column: token.loc.end.column
        });
    }
};

/**
 * Requires tokens to be on the same line.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 */
TokenAssert.prototype.sameLine = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;

    if (!token || !nextToken) {
        return;
    }

    if (token.loc.end.line !== nextToken.loc.start.line) {
        this.emit('error', {
            message: options.message || token.value + ' and ' + nextToken.value + ' should be on the same line',
            line: token.loc.end.line,
            column: token.loc.end.column
        });
    }
};

/**
 * Requires tokens to be on different lines. If atLeast, atMost, and exactly, aren't specified, defaults to at least 1.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.message]
 * @param {Object} [options.atLeast] At least how many lines the tokens are apart
 * @param {Object} [options.atMost] At most how many lines the tokens are apart
 * @param {object} [options.exactly] Exactly how many lines the tokens are apart
 */
TokenAssert.prototype.differentLine = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;

    if (!token || !nextToken) {
        return;
    }

    var atLeast;
    var atMost;
    var exactly;

    var useOptions = options.hasOwnProperty('atLeast') ||
        options.hasOwnProperty('atMost') ||
        options.hasOwnProperty('exactly');

    if (useOptions) {
        atLeast = options.atLeast;
        atMost = options.atMost;
        exactly = options.exactly;
    } else {
        atLeast = 1;
    }

    var errorMessage = token.value + ' and ' + nextToken.value + ' should be ';

    var emitError = (function(message) {
        this.emit('error', {
            message: options.message || errorMessage + message + ' line(s) apart',
            line: token.loc.end.line,
            column: token.loc.end.column
        });
    }).bind(this);

    var lineDifference = Math.abs(token.loc.end.line - nextToken.loc.start.line);

    if (atLeast !== undefined) {
        if (lineDifference < atLeast) {
            emitError('at least ' + atLeast);
        }
    }

    if (atMost !== undefined) {
        if (lineDifference > atMost) {
            emitError('at most ' + atMost);
        }
    }

    if (exactly !== undefined) {
        if (lineDifference !== exactly) {
            emitError('exactly ' + exactly);
        }
    }
};

/**
 * Requires specific token before given.
 *
 * @param {Object} options.token
 * @param {Object} options.expectedTokenBefore
 * @param {String} [options.message]
 */
TokenAssert.prototype.tokenBefore = function(options) {
    var token = options.token;
    var actualTokenBefore = this._file.getPrevToken(token);
    var expectedTokenBefore = options.expectedTokenBefore;
    if (!actualTokenBefore) {
        this.emit('error', {
            message: expectedTokenBefore.value + ' was expected before ' + token.value + ' but document start found',
            line: token.loc.start.line,
            column: token.loc.start.column
        });
        return;
    }
    if (
        actualTokenBefore.type !== expectedTokenBefore.type ||
        actualTokenBefore.value !== expectedTokenBefore.value
    ) {
        var message = options.message;
        if (!message) {
            var showTypes = expectedTokenBefore.value === actualTokenBefore.value;
            message =
                expectedTokenBefore.value + (showTypes ? ' (' + expectedTokenBefore.type + ')' : '') +
                ' was expected before ' + token.value +
                ' but ' + actualTokenBefore.value + (showTypes ? ' (' + actualTokenBefore.type + ')' : '') + ' found';
        }
        this.emit('error', {
            message: message,
            line: actualTokenBefore.loc.end.line,
            column: actualTokenBefore.loc.end.column
        });
    }
};
/**
 * Disallows specific token before given.
 *
 * @param {Object} options.token
 * @param {Object} options.expectedTokenBefore
 * @param {String} [options.message]
 */
TokenAssert.prototype.noTokenBefore = function(options) {
    var token = options.token;
    var actualTokenBefore = this._file.getPrevToken(token);
    if (!actualTokenBefore) {
        // document start
        return;
    }
    var expectedTokenBefore = options.expectedTokenBefore;
    if (actualTokenBefore.type === expectedTokenBefore.type &&
        actualTokenBefore.value === expectedTokenBefore.value
    ) {
        this.emit('error', {
            message: options.message || 'Illegal ' + expectedTokenBefore.value + ' was found before ' + token.value,
            line: actualTokenBefore.loc.end.line,
            column: actualTokenBefore.loc.end.column
        });
    }
};

module.exports = TokenAssert;
