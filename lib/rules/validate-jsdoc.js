var assert = require('assert'),
    treeIterator = require('../tree-iterator');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(typeof options === 'object', 'validateJSDoc option requires object value');
        this._options = options;
    },

    getOptionName: function () {
        return 'validateJSDoc';
    },

    check: function(file, errors) {
        var options = this._options;
        var comments = file.getComments();
        var lineValidators = [];

        // create validators list
        if (options.checkParamNames || options.checkRedundantParams || options.requireParamTypes) {
            lineValidators.push(validateParamLine);
        }
        if (options.checkReturnTypes || options.checkRedundantReturns || options.requireReturnTypes) {
            lineValidators.push(validateReturnsLine);
        }

        // skip if there is nothing to check
        if (!lineValidators.length) {
            return;
        }

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var jsDoc = getJsDocForLine(node.loc.start.line);
            if (!jsDoc) {
                return;
            }

            var jsDocLines = jsDoc.value.split('\n');
            node.jsDoc = node.jsDoc || {};
            node.jsDoc.paramIndex = 0;

            function addError (text, locStart) {
                locStart = locStart || {};
                errors.add(
                    text,
                    locStart.line || (jsDoc.loc.start.line + i),
                    locStart.column || (jsDocLines[i].indexOf('@'))
                );
            }

            for (var i = 0, l = jsDocLines.length; i < l; i++) {
                var line = jsDocLines[i].trim();
                if (line.charAt(0) !== '*') {
                    continue;
                }

                line = line.substr(1).trim();

                for (var j = 0, k = lineValidators.length; j < k; j++) {
                    lineValidators[j](node, line, addError);
                }
            }
        });

        function getJsDocForLine(line) {
            line--;
            for (var i = 0, l = comments.length; i < l; i++) {
                var comment = comments[i];
                if (comment.loc.end.line === line && comment.type === 'Block' && comment.value.charAt(0) === '*') {
                    return comment;
                }
            }
            return null;
        }

        /**
         * validator for @param
         * @param {(FunctionDeclaration|FunctionExpression)} node
         * @param {Number} line
         * @param {Function} err
         */
        function validateParamLine(node, line, err) {
            if (line.indexOf('@param') !== 0) {
                return;
            }

            // checking validity
            var match = line.match(/^@param\s+(?:{(.+?)})?\s*(?:\[)?([a-zA-Z0-9_\.\$]+)/);
            if (!match) {
                return err('Invalid JSDoc @param');
            }

            var jsDocParamType = match[1];
            var jsDocParamName = match[2];

            // checking existance
            if (options.requireParamTypes && !jsDocParamType) {
                return err('Missing JSDoc @param type');
            }

            // skip if there is dot in param name (object's inner param)
            if (jsDocParamName.indexOf('.') !== -1) {
                return;
            }

            // checking redudant
            var param = node.params[node.jsDoc.paramIndex];
            if (options.checkRedundantParams && !param) {
                return err('Redundant JSDoc @param');
            }

            // checking name
            if (options.checkParamNames && jsDocParamName !== param.name) {
                return err('Invalid JSDoc @param argument name');
            }

            node.jsDoc.paramIndex++;
        }

        /**
         * validator for @return/@returns
         * @param {(FunctionDeclaration|FunctionExpression)} node
         * @param {Number} line
         * @param {Function} err
         */
        function validateReturnsLine(node, line, err) {
            if (line.indexOf('@return') !== 0) {
                return;
            }

            // checking validity
            var match = line.match(/^@returns?\s+(?:{(.+?)})?/);
            if (!match) {
                return err('Invalid JSDoc @returns');
            }

            var jsDocType = match[1];

            // checking existance
            if (options.requireReturnTypes && !jsDocType) {
                err('Missing JSDoc @returns type');
            }

            var jsDocParsedType = jsDocTypeParse(jsDocType);

            if (options.checkRedundantReturns || options.checkReturnTypes) {
                var returnsArgumentStatements = [];

                treeIterator.iterate(node, function(n/*, parentNode, parentCollection*/) {
                    if (n && n.type === 'ReturnStatement' && n.argument) {
                        if (node === closestScopeNode(n)) {
                            returnsArgumentStatements.push(n.argument);
                        }
                    }
                });

                // checking redundant
                if (options.checkRedundantReturns && !returnsArgumentStatements.length) {
                    err('Redundant JSDoc @returns');
                }

                // try to check returns types
                if (options.checkReturnTypes && jsDocParsedType) {
                    returnsArgumentStatements.forEach(function (argument) {
                        if (!jsDocMatchType(jsDocParsedType, argument)) {
                            err('Wrong returns value', argument.loc.start);
                        }
                    });
                }
            }
        }

    }

};

function closestScopeNode (n) {
    while (!(n.type === 'FunctionExpression' || n.type === 'FunctionDeclaration')) {
        n = n.parentNode;
    }
    return n;
}

function jsDocTypeParse (type) {
    type = type.trim();
    if (type.indexOf('...') === 0 || type.indexOf('(') === 0 || type.indexOf('|') !== -1 || type.indexOf('.') !== -1) {
        return null;
    }
    if (type.indexOf('[]') > 0) {
        return 'Array';
    }
    if (type[0] === '{') {
        return 'Object';
    }
    return type;
}

function jsDocMatchType (type, argument) {
    type = type.toLowerCase();

    if (argument.type === 'Literal') {
        if (typeof argument.value !== 'object') {
            return type === typeof argument.value;
        }
        if (!argument.value.type) {
            return type === (argument.value instanceof RegExp ? 'regexp' : 'object');
        }
        return type === argument.value.type;

    } else if (argument.type === 'ObjectExpression') {
        return (type === 'object');

    } else if (argument.type === 'ArrayExpression') {
        return (type === 'array');

    } else if (argument.type === 'NewExpression') {
        return (type === 'object') || (type === argument.callee.name.toLowerCase());
    }
    // variables, expressions, another behavior
    return true;
}
