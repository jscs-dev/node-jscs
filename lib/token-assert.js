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
            nextToken.whitespaceBefore = new Array(spaces + 1).join(' ');
            this.emit('error', {
                message: options.message ||
                    spaces + ' spaces required between ' + token.value + ' and ' + nextToken.value,
                line: token.loc.end.line,
                column: token.loc.end.column,
                fixed: true
            });
        }
    } else {
        if (nextToken.range[0] === token.range[1]) {
            nextToken.whitespaceBefore = ' ';
            this.emit('error', {
                message: options.message || 'Missing space between ' + token.value + ' and ' + nextToken.value,
                line: token.loc.end.line,
                column: token.loc.end.column,
                fixed: true
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
        nextToken.whitespaceBefore = '';
        this.emit('error', {
            message: options.message || 'Unexpected whitespace between ' + token.value + ' and ' + nextToken.value,
            line: token.loc.end.line,
            column: token.loc.end.column,
            fixed: true
        });
    }
};

/**
 * Requires tokens to be on the same line.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {String} [options.message]
 * @param {Boolean} [options.requireNextToken=false]
 */
TokenAssert.prototype.sameLine = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;

    if (options.requireNextToken && (!nextToken || nextToken.type === 'EOF')) {
        this.emit('error', {
            message: options.message || token.value + ' should not be the last in the file',
            line: token.loc.end.line,
            column: token.loc.end.column
        });
        return;
    }

    if (!token || !nextToken) {
        return;
    }

    options.message = options.message || token.value + ' and ' + nextToken.value + ' should be on the same line';
    options.exactly = 0;

    this.linesBetween(options);
};

/**
 * Requires tokens to be on different lines.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.message]
 */
TokenAssert.prototype.differentLine = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;

    if (!token || !nextToken) {
        return;
    }

    options.message = options.message || token.value + ' and ' + nextToken.value + ' should be on different lines';
    options.atLeast = 1;

    this.linesBetween(options);
};

/**
 * Requires tokens to have a certain amount of lines between them.
 * Set at least one of atLeast or atMost OR set exactly.
 *
 * @param {Object} options.token
 * @param {Object} options.nextToken
 * @param {Object} [options.message]
 * @param {Object} [options.atLeast] At least how many lines the tokens are apart
 * @param {Object} [options.atMost] At most how many lines the tokens are apart
 * @param {object} [options.exactly] Exactly how many lines the tokens are apart
 */
TokenAssert.prototype.linesBetween = function(options) {
    var token = options.token;
    var nextToken = options.nextToken;
    var whitespaceBefore = ' ';

    if (!token || !nextToken) {
        return;
    }

    var atLeast = options.atLeast;
    var atMost = options.atMost;
    var exactly = options.exactly;

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

    var linesBetween = Math.abs(token.loc.end.line - nextToken.loc.start.line);

    var errorMessage = token.value + ' and ' + nextToken.value + ' should have ';
    var emitError = (function(message, whitespaceBefore) {
        var fixed = typeof whitespaceBefore !== 'undefined';
        if (fixed) {
            nextToken.whitespaceBefore = whitespaceBefore;
        }

        this.emit('error', {
            message: options.message || errorMessage + message + ' line(s) between them',
            line: token.loc.end.line,
            column: token.loc.end.column,
            fixed: fixed
        });
    }).bind(this);

    if (atLeast !== undefined && linesBetween < atLeast) {
        whitespaceBefore = new Array(atLeast).join('\n');
        emitError('at least ' + atLeast);
    }

    if (atMost !== undefined && linesBetween > atMost) {
        whitespaceBefore = new Array(atMost).join('\n');
        emitError('at most ' + atMost);
    }

    if (exactly !== undefined && linesBetween !== exactly) {
        if (exactly > 0) {
            whitespaceBefore = new Array(exactly).join('\n');
        }

        emitError('exactly ' + exactly, whitespaceBefore);
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
