/**
 * Returns token by range start. Ignores ()
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.getTokenByRangeStart = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // if token is ")" -> get next token
    // for example (a) + (b)
    // next token ---^
    // we should find (a) + (b)
    // ------------------^
    if (this.isTokenParenthesis(file, range, backward)) {
        var pos = backward ? token.range[0] - 1 : token.range[1];
        tokenPos = file.getTokenPosByRangeStart(pos);
        token = tokens[tokenPos];
    }

    return token || null;
};

/**
 * Is next/previous token a parentheses?
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 * @returns {Boolean}
 */
exports.isTokenParenthesis = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // we should check for "(" if we go backward
    var parenthesis = backward ? '(' : ')';

    return token && token.type === 'Punctuator' && token.value === parenthesis;
};

/**
 * Returns true if token is punctuator
 *
 * @param {Object} token
 * @param {String} punctuator
 * @returns {Boolean}
 */
exports.tokenIsPunctuator = function(token, punctuator) {
    return token && token.type === 'Punctuator' && token.value === punctuator;
};

/**
 * Find next/previous operator by range start
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {String} operator
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.findOperatorByRangeStart = function(file, range, operator, backward) {
    var tokens = file.getTokens();
    var index = file.getTokenPosByRangeStart(range);

    while (tokens[ index ]) {
        if (tokens[ index ].value === operator) {
            return tokens[ index ];
        }

        if (backward) {
            index--;
        } else {
            index++;
        }
    }

    return null;
};

/**
 * Returns token or false if there is a punctuator in a given range
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {String} operator
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.getTokenByRangeStartIfPunctuator = function(file, range, operator, backward) {
    var part = this.getTokenByRangeStart(file, range, backward);

    if (this.tokenIsPunctuator(part, operator)) {
        return part;
    }

    return null;
};

/**
 * Get column for long entities
 * @param {Number} column
 * @param {Number} length
 * @return {Number}
 */
exports.getPointerEntities = function(column, length) {
    return column - 1 + Math.ceil(length / 2);
};
