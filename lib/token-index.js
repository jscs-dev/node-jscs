var assign = require('lodash').assign;

var BLOCK_REGEXP = /^\s*(?:jscs\s*:\s*(en|dis)able)(.*)/;
var LINE_REGEXP = /^\s*(?:jscs\s*:\s*ignore)(.*)/;

/**
 * Parses rule names in enable/disable/ignore statements.
 *
 * @param {String} text
 * @param {Boolean} enabled
 * @returns {Object}
 */
function parseRuleNames(text, enabled) {
    text = text.trim();

    if (!text) {
        return {'*': enabled};
    }

    return text.split(',').reduce(function(result, ruleName) {
        ruleName = ruleName.trim();
        if (ruleName) {
            result[ruleName] = enabled;
        }
        return result;
    }, {});
}

/**
 * Pragma index implementation.
 * Checks if rule is enabled or disabled for the specified element.
 *
 * @param {Element} firstToken
 * @constructor
 */
function TokenIndex(firstToken) {
    this._buildIndex(firstToken);
}

/**
 * Builds pragma index.
 *
 * @param {Element} firstToken
 * @private
 */
TokenIndex.prototype._buildIndex = function(firstToken) {
    this._hasPragmas = false;

    var tokens = [];
    var index = [];
    var positions = [];
    var currentPosition = 0;
    var currentToken = firstToken;
    var lastBlockState = {'*': true};
    var tokenState;
    var previousLoc = {line: 1, column: 0};

    while (currentToken) {
        tokens.push(currentToken);
        currentToken.__loc = previousLoc;

        var newlineCount = currentToken.getNewlineCount();
        if (newlineCount > 0) {
            var lines = currentToken.getSourceCodeLines();
            previousLoc = {
                line: previousLoc.line + newlineCount,
                column: lines[lines.length - 1].length
            };
        } else {
            previousLoc = {
                line: previousLoc.line,
                column: previousLoc.column + currentToken.getSourceCodeLength()
            };
        }

        if (currentToken.isComment) {
            var value = currentToken.value;
            var blockMatch = BLOCK_REGEXP.exec(value);
            if (blockMatch) {
                this._hasPragmas = true;
                lastBlockState = assign({}, lastBlockState, parseRuleNames(blockMatch[2], blockMatch[1] === 'en'));
                tokenState = lastBlockState;
            } else {
                var lineMatch = LINE_REGEXP.exec(value);
                if (lineMatch) {
                    this._hasPragmas = true;
                    var ignoreState = parseRuleNames(lineMatch[1], false);
                    index.push(null);
                    var ignoreToken = currentToken.getPreviousToken();
                    var i = index.length - 1;
                    while (ignoreToken) {
                        i--;
                        index[i] = assign({}, index[i], ignoreState);
                        if (ignoreToken.getNewlineCount() > 0) {
                            break;
                        }
                        ignoreToken = ignoreToken.getPreviousToken();
                    }
                    ignoreToken = currentToken.getNextToken();
                    while (ignoreToken) {
                        index.push(ignoreState);
                        if (ignoreToken.getNewlineCount() > 0) {
                            break;
                        }
                        ignoreToken = ignoreToken.getNextToken();
                    }
                    tokenState = assign({}, lastBlockState, ignoreState);
                } else {
                    tokenState = lastBlockState;
                }
            }
        } else {
            tokenState = lastBlockState;
        }

        if (index[currentPosition]) {
            tokenState = assign({}, tokenState, index[currentPosition]);
        }

        index[currentPosition] = tokenState;
        currentPosition++;

        currentToken = currentToken.getNextToken();
    }
    this._tokens = tokens;
    this._index = index;
    this._positions = positions;
};

/**
 * Checks if rule whether rule is enabled for the specified element.
 *
 * @param {String} ruleName
 * @param {Element} element
 * @returns {Boolean}
 */
TokenIndex.prototype.isRuleEnabled = function(ruleName, element) {
    if (!this._hasPragmas) {
        return true;
    }
    var pos = this._tokens.indexOf(element.getFirstToken());
    if (pos !== -1) {
        var state = this._index[pos];
        if (ruleName in state) {
            return state[ruleName];
        }

        return state['*'];
    }

    return true;
};

/**
 * Return calculated element location.
 *
 * @param {Element} element
 * @returns {Object}
 */
TokenIndex.prototype.getElementLoc = function(element) {
    return element.getFirstToken().__loc ||  {
        line: 1,
        column: 0
    };
};

module.exports = TokenIndex;

