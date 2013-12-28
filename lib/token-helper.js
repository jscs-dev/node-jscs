/**
 * Returns token by range start. Ignores ()
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 */
module.exports.getTokenByRangeStart = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // we should check for "(" if we go backward
    var parenthesis = backward ? '(' : ')';

    // if token is ")" -> get next token
    // for example (a) + (b)
    // next token ---^
    // we should find (a) + (b)
    // ------------------^
    if (token &&
        token.type === 'Punctuator' &&
        token.value === parenthesis
    ) {
        var pos = backward ? token.range[0] - 1 : token.range[1];
        tokenPos = file.getTokenPosByRangeStart(pos);
        token = tokens[tokenPos];
    }

    return token;
};

/**
 * Returns true if token is punctuator
 * @param {Object} token
 * @param {String} punctuator
 */
module.exports.tokenIsPunctuator = function(token, punctuator) {
    return token && token.type === 'Punctuator' && token.value === punctuator;
};

/**
 * Returns true if token is a reserved word
 * @param {Object} token
 */
module.exports.tokenIsReservedWord = function(token) {
    var keywords = {
        'arguments': true,
        'break': true,
        'case': true,
        'catch': true,
        'class': true,
        'continue': true,
        'debugger': true,
        'default': true,
        'delete': true,
        'do': true,
        'else': true,
        'enum': true,
        'eval': true,
        'export': true,
        'extends': true,
        'finally': true,
        'for': true,
        'function': true,
        'if': true,
        'implements': true,
        'import': true,
        'in': true,
        'instanceof': true,
        'interface': true,
        'let': true,
        'new': true,
        'package': true,
        'private': true,
        'protected': true,
        'public': true,
        'return': true,
        'static': true,
        'super': true,
        'switch': true,
        'this': true,
        'throw': true,
        'try': true,
        'typeof': true,
        'var': true,
        'void': true,
        'while': true,
        'with': true,
        'yield': true
    };
    return token && token.value && keywords[token.value];
};
