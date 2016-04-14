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
function PragmaIndex(firstToken) {
    this._buildIndex(firstToken);
}

/**
 * Builds pragma index.
 *
 * @param {Element} firstToken
 * @private
 */
PragmaIndex.prototype._buildIndex = function(firstToken) {
    var tokens = [];
    var index = [];
    var currentPosition = 0;
    var currentToken = firstToken;
    var lastBlockState = {'*': true};
    var tokenState;

    while (currentToken) {
        tokens.push(currentToken);
        if (currentToken.isComment) {
            var value = currentToken.value;
            var blockMatch = BLOCK_REGEXP.exec(value);
            if (blockMatch) {
                lastBlockState = assign({}, lastBlockState, parseRuleNames(blockMatch[2], blockMatch[1] === 'en'));
                tokenState = lastBlockState;
            } else {
                var lineMatch = LINE_REGEXP.exec(value);
                if (lineMatch) {
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
};

/**
 * Checks if rule whether rule is enabled for the specified element.
 *
 * @param {String} ruleName
 * @param {Element} element
 * @returns {Boolean}
 */
PragmaIndex.prototype.isRuleEnabled = function(ruleName, element) {
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

module.exports = PragmaIndex;

