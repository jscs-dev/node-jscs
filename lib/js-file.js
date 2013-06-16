var treeIterator = require('./tree-iterator');

var JsFile = function(filename, source, tree) {
    this._filename = filename;
    this._source = source;
    this._tree = tree;
    this._lines = source.split('\n');
    this._tokenIndex = null;
    var index = this._index = {};
    this.iterate(function(node) {
        if (node) {
            var type = node.type;
            if (type) {
                (index[type] || (index[type] = [])).push(node);
            }
        }
    });
};

JsFile.prototype = {
    _buildTokenIndex: function() {
        var tokens = this._tree.tokens;
        var tokenIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenIndex[tokens[i].range[0]] = i;
        }
        this._tokenIndex = tokenIndex;
    },
    getTokenPosByRangeStart: function(start) {
        if (!this._tokenIndex) {
            this._buildTokenIndex();
        }
        return this._tokenIndex[start];
    },
    iterate: function(cb) {
        return treeIterator.iterate(this._tree, cb);
    },
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
    iterateNodesByType: function(type, cb) {
        return this.getNodesByType(type).forEach(cb);
    },
    getSource: function() {
        return this._source;
    },
    getTree: function() {
        return this._tree;
    },
    getTokens: function() {
        return this._tree.tokens;
    },
    getComments: function() {
        return this._tree.comments;
    },
    getFilename: function() {
        return this._filename;
    },
    getLines: function() {
        return this._lines;
    }
};

module.exports = JsFile;
