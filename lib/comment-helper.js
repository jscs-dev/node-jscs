/**
 * Returns the lines from a file with comments removed. Will report erroneous
 * trailing tokens in multiline comments if an error reporter is provided.
 *
 * @param {JsFile} file
 * @param {Errors} [errors=null] errors
 * @returns {Array}
 */
exports.getLinesWithCommentsRemoved = function(file, errors) {
    var lines = file.getLines().concat();
    file.getComments().reverse().forEach(function(comment) {
        var startLine = comment.loc.start.line;
        var startCol = comment.loc.start.column;
        var endLine = comment.loc.end.line;
        var endCol = comment.loc.end.column;
        var i = startLine - 1;

        if (startLine === endLine) {
            lines[i] = lines[i].substring(0, startCol) + lines[i].substring(endCol);
        } else {
            lines[i] = lines[i].substring(0, startCol);
            for (var x = i + 1; x < endLine - 1; x++) {
                lines[x] = '';
            }
            lines[x] = lines[x].substring(endCol + 1);

            if (errors && lines[x] !== '') {
                errors.add(
                    'Multiline comments should not have tokens on its ending line',
                    x + 1,
                    endCol
                );
            }
        }
    });
    return lines;
};
