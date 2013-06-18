var colors = require('colors');

var Errors = function(file) {
    this._errorList = [];
    this._file = file;
};

Errors.prototype = {

    add: function(message, line, column) {
        if (typeof line === 'object') {
            column = line.column;
            line = line.line;
        }
        this._errorList.push({
            message: message,
            line: line,
            column: column
        });
    },

    getErrorList: function() {
        return this._errorList;
    },

    getFilename: function() {
        return this._file.getFilename();
    },

    isEmpty: function() {
        return this._errorList.length === 0;
    },

    getErrorCount: function () {
        return this._errorList.length;
    },

    explainError: function(error, colorize) {
        var lineNumber = error.line - 1;
        var lines = this._file.getLines();
        var result = [
            renderLine(lineNumber, lines[lineNumber], colorize),
            renderPointer(error.column, colorize)
        ];
        var i = lineNumber - 1;
        var linesAround = 2;
        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i], colorize));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i], colorize));
            i++;
        }
        result.unshift(formatErrorMessage(error.message, this.getFilename(), colorize));
        return result.join('\n');
    }

};

function formatErrorMessage(message, filename, colorize) {
    return (colorize ? colors.bold(message) : message) +
        ' at ' +
        (colorize ? colors.green(filename) : filename) + ' :';
}

function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

function renderLine(n, line, colorize) {
    var lineNumber = prependSpaces(n.toString(), 5) + ' |';
    return ' ' + (colorize ? colors.grey(lineNumber) : lineNumber) + line;
}

function renderPointer(column, colorize) {
    var res = (new Array(column + 9)).join('-') + '^';
    return colorize ? colors.grey(res) : res;
}

module.exports = Errors;
