var assert = require('assert'),
    treeIterator = require('./tree-iterator');

/**
 * File representation for JSCS.
 *
 * @name JsFile
 */
var JsFile = function(filename, source, tree) {
    this._filename = filename;
    this._source = source;
    this._tree = tree;
    this._lines = source.split(/\r\n|\r|\n/);
    this._tokenIndex = null;
    var index = this._index = {};
    this.iterate(function(node, parentNode, parentCollection) {
        if (node) {
            var type = node.type;
            if (type) {
                node.parentNode = parentNode;
                node.parentCollection = parentCollection;
                (index[type] || (index[type] = [])).push(node);
            }
        }
    });
};

JsFile.prototype = {
    /**
     * Builds token index by starting pos for futher navigation.
     */
    _buildTokenIndex: function() {
        var tokens = this._tree.tokens;
        var tokenIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenIndex[tokens[i].range[0]] = i;
        }
        this._tokenIndex = tokenIndex;
    },
    /**
     * Returns token position using range start from the index.
     *
     * @returns {Object}
     */
    getTokenPosByRangeStart: function(start) {
        if (!this._tokenIndex) {
            this._buildTokenIndex();
        }
        return this._tokenIndex[start];
    },
    /**
     * Returns token location using range start from the index.
     *
     * @param {Number} start Range start index
     * @param {Object} [options]
     * @param {Number} [options.xOffset] Correction for the "line" value. Defaults to 0
     * @param {Number} [options.yOffset] Correction for the "column" value. Defaults to 0
     * @param {String} [options.position] "start" or "end". Defaults to "start"
     * @returns {Object}
     */
    getTokenLocByRangeStart: function(start, options) {

        var xOffset = options.xOffset || 0,
            yOffset = options.yOffset || 0,
            position = options.position || 'start',
            token = this.getTokens()[this.getTokenPosByRangeStart(start)],
            loc;

        assert(token, 'There is no token with range start at ' + start);

        loc = token.loc[position];

        return {
            line: loc.line + yOffset,
            column: loc.column + xOffset
        };
    },
    /**
     * Iterates through the token tree using tree iterator.
     * Calls passed function for every token.
     *
     * @param {Function} cb
     */
    iterate: function(cb) {
        return treeIterator.iterate(this._tree, cb);
    },
    /**
     * Returns tokens by type(s) from earlier built index.
     *
     * @param {String|String[]} type
     * @returns {Object[]}
     */
    getNodesByType: function(type) {
        if (typeof type === 'string') {
            return this._index[type] || [];
        } else {
            var result = [];
            for (var i = 0, l = type.length; i < l; i++) {
                var nodes = this._index[type[i]];
                if (nodes) {
                    result = result.concat(nodes);
                }
            }
            return result;
        }
    },
    /**
     * Iterates tokens by type(s) from earlier built index.
     * Calls passed function for every matched token.
     *
     * @param {String|String[]} type
     * @param {Function} cb
     */
    iterateNodesByType: function(type, cb) {
        return this.getNodesByType(type).forEach(cb);
    },
    /**
     * Returns string representing contents of the file.
     *
     * @returns {String}
     */
    getSource: function() {
        return this._source;
    },
    /**
     * Returns token tree, built using esprima.
     *
     * @returns {Object}
     */
    getTree: function() {
        return this._tree;
    },
    /**
     * Returns token list, built using esprima.
     *
     * @returns {Object[]}
     */
    getTokens: function() {
        return this._tree.tokens;
    },
    /**
     * Returns comment token list, built using esprima.
     */
    getComments: function() {
        return this._tree.comments;
    },
    /**
     * Returns source filename for this object representation.
     *
     * @returns {String}
     */
    getFilename: function() {
        return this._filename;
    },
    /**
     * Returns array of source lines for the file.
     *
     * @returns {String[]}
     */
    getLines: function() {
        return this._lines;
    }
};

module.exports = JsFile;
