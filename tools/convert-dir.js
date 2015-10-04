var vowFs = require('vow-fs');
var vow = require('vow');
var path = require('path');
var Parser = require('cst').Parser;

var parser = new Parser();

var cwd = process.cwd();

function convertDir(directoryPaths, converter) {
    directoryPaths = [].concat(directoryPaths);
    return vow.all(directoryPaths.map(function(directoryPath) {
        return vowFs.listDir(directoryPath).then(function(filenames) {
            return vow.all(filenames.map(function(filename) {
                var fullPath = path.join(directoryPath, filename);
                var relativePath = path.relative(cwd, fullPath);
                return vowFs.stat(fullPath).then(function(stat) {
                    if (stat.isDirectory()) {
                        return convertDir(fullPath, converter);
                    } else {
                        if (fullPath.match(/\.js$/)) {
                            return vowFs.read(fullPath, 'utf8').then(function(content) {
                                var program;
                                try {
                                    program = parser.parse(content);
                                } catch (e) {
                                    e.message = relativePath + ': ' + e.message;
                                    throw e;
                                }
                                converter(program, {
                                    relativePath: relativePath,
                                    log: function(element, message) {
                                        logElement(relativePath, element, message)
                                    }
                                });
                                return vowFs.write(fullPath, program.sourceCode);
                            });
                        }
                    }
                });
            }));
        });
    }));
}

function logElement(filename, element, message) {
    console.log((message || '') + ':', filename + ':' + element.loc.start.line);
    var sources = element.sourceCode;
    var token = element.previousToken;
    while (token && token.loc.end.line === element.loc.start.line) {
        sources = token.sourceCode + sources;
        token = token.previousToken;
    }
    console.log(sources);
    console.log();
    console.log();
}

module.exports = convertDir;
