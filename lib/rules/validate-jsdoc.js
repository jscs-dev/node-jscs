var assert = require('assert'),

    jsDocHelpers = require('../jsdoc-helpers'),
    esprimaHelpers = require('../esprima-helpers');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(typeof options === 'object', 'validateJSDoc option requires object value');
        this._options = options;
    },

    getOptionName: function() {
        return 'validateJSDoc';
    },

    check: function(file, errors) {
        var options = this._options;
        var lineValidators = [];

        // create validators list
        if (options.checkParamNames || options.checkRedundantParams || options.requireParamTypes) {
            lineValidators.push(validateParamLine);
        }
        if (options.checkReturnTypes || options.checkRedundantReturns || options.checkTypes ||
            options.requireReturnTypes) {
            lineValidators.push(validateReturnsLine);
        }

        // skip if there is nothing to check
        if (!lineValidators.length) {
            return;
        }

        var jsDocs = jsDocHelpers.parseComments(file.getComments());

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var jsDoc = jsDocs.node(node);
            if (!jsDoc) {
                return;
            }

            node.jsDoc = jsDoc.value.split('\n');
            node.jsDoc = node.jsDoc || {};
            node.jsDoc.paramIndex = 0;

            function addError (text, locStart) {
                locStart = locStart || {};
                errors.add(
                    text,
                    locStart.line || (jsDoc.loc.start.line + i),
                    locStart.column || (node.jsDoc[i].indexOf('@'))
                );
            }

            for (var i = 0, l = node.jsDoc.length; i < l; i++) {
                var line = node.jsDoc[i].trim();
                if (line.charAt(0) !== '*') {
                    continue;
                }

                line = line.substr(1).trim();

                for (var j = 0, k = lineValidators.length; j < k; j++) {
                    lineValidators[j](node, line, addError);
                }
            }
        });

        /**
         * validator for @param
         * @param {{type: 'FunctionDeclaration'}|{type: 'FunctionExpression'}} node
         * @param {Number} line
         * @param {Function} err
         */
        function validateParamLine(node, line, err) {
            if (line.indexOf('@param') !== 0) {
                return;
            }

            // checking validity
            var match = line.match(/^@param\s+(?:{(.+?)})?\s*(\[)?([a-zA-Z0-9_\.\$]+)/);
            if (!match) {
                return err('Invalid JsDoc @param');
            }

            var jsDocType = match[1];
            var jsDocName = match[3];
            var jsDocOptional = match[2] === '[';

            // checking existance
            if (options.requireParamTypes && !jsDocType) {
                return err('Missing JsDoc @param type');
            }

            var jsDocParsedType = jsDocHelpers.parse(jsDocType);
            if (options.checkTypes && jsDocParsedType.invalid) {
                return err('Invalid JsDoc type definition');
            }

            // skip if there is dot in param name (object's inner param)
            if (jsDocName.indexOf('.') !== -1) {
                return;
            }

            // checking redudant
            var param = node.params[node.jsDoc.paramIndex];
            if (options.checkRedundantParams && !jsDocOptional && !param) {
                return err('Redundant JsDoc @param');
            }

            // checking name
            if (options.checkParamNames && jsDocName !== param.name) {
                return err('Invalid JsDoc @param argument name');
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
                return err('Invalid JsDoc @returns');
            }

            var jsDocType = match[1];

            // checking existance
            if (options.requireReturnTypes && !jsDocType) {
                err('Missing JsDoc @returns type');
            }

            var jsDocParsedType = jsDocHelpers.parse(jsDocType);
            if (options.checkTypes && jsDocParsedType.invalid) {
                return err('Invalid JsDoc type definition');
            }

            if (!options.checkRedundantReturns && !options.checkReturnTypes) {
                return;
            }

            var returnsArgumentStatements = [];
            esprimaHelpers.treeIterator.iterate(node, function(n/*, parentNode, parentCollection*/) {
                if (n && n.type === 'ReturnStatement' && n.argument) {
                    if (node === esprimaHelpers.closestScopeNode(n)) {
                        returnsArgumentStatements.push(n.argument);
                    }
                }
            });

            // checking redundant
            if (options.checkRedundantReturns && !returnsArgumentStatements.length) {
                err('Redundant JsDoc @returns');
            }

            // try to check returns types
            if (options.checkReturnTypes && jsDocParsedType) {
                returnsArgumentStatements.forEach(function (argument) {
                    if (!jsDocHelpers.match(jsDocParsedType, argument)) {
                        err('Wrong returns value', argument.loc.start);
                    }
                });
            }
        }

    }

};
