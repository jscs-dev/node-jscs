var fs = require('fs');
var regenerate = require('regenerate');

var unicodeVersion = '7.0.0';
var categories = ['L', 'Ll', 'Lu', 'Lt', 'Lm', 'Lo', 'Nl', 'Mn', 'Mc', 'Nd', 'Pc'];

var codePoints = {};
categories.forEach(function(category) {
    codePoints[category] = getCodePoint('categories/' + category);
});

// used individually elsewhere
['L', 'Ll', 'Lu'].forEach(function(category) {
    var pattern = regenerate(codePoints[category]);
    saveRegex(category, pattern.toRegExp());
});

var identifiersES5 = generateIdentifierRegexES5();
saveRegex('identifiers-ES5', identifiersES5);

var identifiersES6 = generateIdentifierRegexES6();
saveRegex('identifiers-ES6', identifiersES6);

// regexes based on https://gist.github.com/mathiasbynens/6334847 by @mathias
// note that this regex does not include reserved words;
// those are handled at runtime by the reservedWords library
function generateIdentifierRegexES5() {
    var identifierStart = regenerate('$', '_')
        .add(codePoints.Lu, codePoints.Ll, codePoints.Lt, codePoints.Lm, codePoints.Lo, codePoints.Nl)
        .removeRange(0x010000, 0x10FFFF); // remove astral symbols
    var identifierPart = identifierStart.clone()
        .add('\u200C', '\u200D', codePoints.Mn, codePoints.Mc, codePoints.Nd, codePoints.Pc)
        .removeRange(0x010000, 0x10FFFF); // remove astral symbols
    return compileIdentifierRegex(identifierStart.toString(), identifierPart.toString());
}

function generateIdentifierRegexES6() {
    var ID_START = getCodePoint('properties/ID_Start');
    var ID_CONTINUE = getCodePoint('properties/ID_Continue');
    var OTHER_ID_START = getCodePoint('properties/Other_ID_Start');

    var identifierStart = regenerate(ID_START)
        .add('$', '_');
    var identifierPart = regenerate(ID_CONTINUE)
        .add(OTHER_ID_START)
        .add('$', '_', '\u200C', '\u200D');
    return compileIdentifierRegex(identifierStart.toString(), identifierPart.toString());
}

function getCodePoint(what) {
    return require('unicode-' + unicodeVersion + '/' + what + '/code-points');
}

function compileIdentifierRegex(start, part) {
    return '/^(?:' + start + ')(?:' + part + ')*$/';
}

function saveRegex(file, regex) {
    var source = 'module.exports = ' + regex + ';\n';
    fs.writeFileSync('./patterns/' + file + '.js', source);
}
