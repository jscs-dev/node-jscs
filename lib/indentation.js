var indentableNodes = {
    BlockStatement: 'body',
    Program: 'body',
    ObjectExpression: 'properties',
    ArrayExpression: 'elements',
    SwitchStatement: 'cases',
    SwitchCase: 'consequent'
};

function Indentation(char, size) {
    this.char = char;
    this.size = size;

    this.indentStack = [0];
}

Indentation.prototype.getIndentationFromLine = function(line) {
    var rNotIndentChar = new RegExp('[^' + this.char + ']');
    var firstContent = line.search(rNotIndentChar);

    if (firstContent === -1) {
        firstContent = line.length;
    }
    return firstContent;
};

Indentation.prototype.getExpectedIndentation = function(line, actual) {
    var outdent = this.size * Math.max.apply(null, line.pop);

    var idx = this.indentStack.length - 1;
    var expected = this.indentStack[idx];

    if (!Array.isArray(expected)) {
        expected = [expected];
    }

    expected = expected.map(function(value) {
        if (line.pop.length) {
            value -= outdent;
        }

        return value;
    }).reduce(function(previous, current) {
        // when the expected is an array, resolve the value
        // back into a Number by checking both values are the actual indentation
        return actual === current ? current : previous;
    });

    this.indentStack[idx] = expected;

    line.pop.forEach(function() {
        this.indentStack.pop();
    }, this);

    return expected;
};

Indentation.prototype.pushExpectedIndentations = function(line, lines, actualIndentation) {
    var indents = Math.max.apply(null, line.push);

    var expected = actualIndentation + (this.size * indents);

    // when a line has alternate indentations, push an array of possible values
    // on the stack, to be resolved when checked against an actual indentation
    if (line.pushAltLine.length) {
        expected = [expected];
        line.pushAltLine.forEach(function(altLine) {
            expected.push(lines[altLine].indentation + (this.size * indents));
        }, this);
    }

    line.push.forEach(function() {
        this.indentStack.push(expected);
    }, this);
};

Indentation.isObjectIndentable = function(node) {
    if (!this.isMultiline(node)) {
        return false;
    }

    var children = this.getChildren(node);

    // only check objects that have children and that look like they are trying to adhere
    // to an indentation strategy, i.e. objects that have curly braces on their own lines.
    if (!children.length || node.loc.start.line === children[0].loc.start.line ||
        node.loc.end.line === children[children.length - 1].loc.end.line) {
        return false;
    }

    return true;
};

Indentation.isPropertyIndentable = function(node) {
    return this.isObjectIndentable(node.parentNode);
};

Indentation.isMultiline = function(node) {
    return node.loc.start.line !== node.loc.end.line;
};

Indentation.getChildren = function(node) {
    var childrenProperty = indentableNodes[node.type];

    return node[childrenProperty];
};

module.exports = Indentation;
