var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSemicolon) {
        assert(
            typeof requireSemicolon === 'boolean',
            'requireSemicolon option requires boolean value'
        );
        assert(
            requireSemicolon === true,
            'requireSemicolon option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSemicolon';
    },

    check: function(file, errors) {
        var source = file.getSource();
        var comments = file.getComments();

        // strip comments
        for (var i = 0, comment; comment = comments[i]; i++) {
            var start = comment.range[0];
            var end = comment.range[1];

            source =
                source.substr(0, start) +
                (new Array(end - start + 1)).join('x') +
                source.substr(end);
        }

        // main job
        file.iterateNodesByType([
            'VariableDeclaration',
            'ExpressionStatement',
            'DoWhileStatement',
            'ReturnStatement',
            'ThrowStatement',
            'BreakStatement',
            'ContinueStatement',
            'DebuggerStatement'
        ], function(node) {

            // ignore variable declaration inside for and for-in
            if (node.type === 'VariableDeclaration') {
                if ((node.parentNode.type === 'ForInStatement' && node.parentNode.left === node) ||
                    (node.parentNode.type === 'ForStatement' && node.parentNode.init === node)) {
                    return;
                }
            }

            // match for semicolon at the code fragment end
            var match = source
                .substring(node.range[0], node.range[1])
                .match(/(;?)[\s\r\n]*$/);

            // if no semicolon, compute proper position and add error;
            if (!match[1]) {
                var lastToken;

                // get last token depends on node type
                switch (node.type) {
                    case 'VariableDeclaration':
                        lastToken = node.declarations[node.declarations.length - 1];
                        break;
                    case 'ExpressionStatement':
                        lastToken = node.expression;
                        break;
                    case 'ReturnStatement':
                    case 'ThrowStatement':
                        lastToken = node.argument;
                        break;
                    case 'BreakStatement':
                    case 'ContinueStatement':
                        lastToken = node.label;
                        break;
                    case 'DoWhileStatement':
                        lastToken = node.test;
                        break;
                }

                if (!lastToken) {
                    lastToken = node;
                }

                errors.add(
                    'Semicolon missed',
                    lastToken.loc.end
                );
            }
        });
    }

};
