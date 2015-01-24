// requireMultipleVarDecl
// requireCommaBeforeLineBreak

var currentEntry, // currently selected table entry
    level,        // indentation level
    obj,          // example object literal
    div;          // currently focussed dom node

// disallowSpacesInFunctionDeclaration.beforeOpeningRoundBrace

function outer(c, d) {
    var e = c * d;

    function inner(a, b) {
        return (e * a) + b;
    }

    return inner(0, 1);
}

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func); // disallowSpacesInsideParentheses
        node = node.nextSibling;
    }
}

function getElementsByClassName(className) {
    var results = [];
    walkTheDOM(document.body, function (node) {
        var array,                // array of class names
            ncn = node.className; // the node's classname

// validateQuoteMarks

        if (ncn && ncn.split(' ').indexOf(className) >= 0) {
            results.push(node);
        }
    });
    return results;
}


div.onclick = function (e) {
    return false;
};

obj = {
    method: function () {
        return this.datum; // requireDotNotation
    },
    datum: 0
};

function Entry() {} // requireCapitalizedConstructors

currentEntry = new Entry();

// requireCamelCaseOrUpperCaseIdentifiers
// Global variables should be in all caps.

APP = (function () {
    var keys = [], values = [];

    return {
        get: function (key) { // requireSpaceAfterKeywords: function
            var at = keys.indexOf(key);
            if (at >= 0) {
                return values[at];
            }
        },
        set: function (key, value) {
            var at = keys.indexOf(key);
            if (at < 0) {
                at = keys.length;
            }
            keys[at] = key;
            values[at] = value;
        },
        remove: function (key) {
            var at = keys.indexOf(key);
            if (at >= 0) {
                keys.splice(at, 1);
                values.splice(at, 1);
            }
        }
    };
}()); // requireParenthesesAroundIIFE

// requireCurlyBraces
// requireSpaceAfterKeywords

if (obj.condition) {
    obj.statements();
}

if (obj.condition) {
    obj.statements();
} else {
    obj.statements(); // disallowKeywordsOnNewLine: else
}

if (obj.condition) {
    obj.statements();
} else if (obj.condition) {
    obj.statements();
} else {
    obj.statements();
}

switch (obj.expression) {
case 'value':
    obj.statements();
    break;
default:
    obj.statements();
}

// Confusing
total = subtotal + (+myInput.value);

// Ternary (1 line)
artifact = tok.id === '(number)' ? tok.number : tok.string;

// Ternary (multi-line)
name = ix.test(key)
    ? key
    : '\'' + key.replace(nx, sanitize) + '\'';

// disallowSpacesInsideArrayBrackets
arr = [1, 2, 3];
// requireLineFeedAtFileEnd
