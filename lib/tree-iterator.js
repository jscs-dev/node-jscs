var estraverse = require('estraverse');
var assign     = require('lodash.assign');
var types      = require('babel-core').types;
assign(estraverse.VisitorKeys, types.VISITOR_KEYS);

module.exports = {
    iterate: iterate
};

function iterate(node, cb) {
    if ('type' in node) {
        estraverse.traverse(node, {
            enter: function(node, parent) {
                var parentCollection = [];

                // parentCollection support
                var path = this.path();
                if (path) {
                    var collectionKey;
                    while (path.length > 0) {
                        var pathElement = path.pop();
                        if (typeof pathElement === 'string') {
                            collectionKey = pathElement;
                            break;
                        }
                    }

                    parentCollection = parent[collectionKey];
                    if (!Array.isArray(parentCollection)) {
                        parentCollection = [parentCollection];
                    }
                }

                if (cb(node, parent, parentCollection) === false) {
                    return estraverse.VisitorOption.Skip;
                }
            },
            keys: {
                JSXIdentifier: [],
                JSXNamespacedName: ['namespace', 'name'],
                JSXMemberExpression: ['object', 'property'],
                JSXEmptyExpression: [],
                JSXExpressionContainer: ['expression'],
                JSXElement: ['openingElement', 'closingElement', 'children'],
                JSXClosingElement: ['name'],
                JSXOpeningElement: ['name', 'attributes'],
                JSXAttribute: ['name', 'value'],
                JSXSpreadAttribute: ['argument'],
                JSXText: null,
                XJSIdentifier: [],
                XJSNamespacedName: ['namespace', 'name'],
                XJSMemberExpression: ['object', 'property'],
                XJSEmptyExpression: [],
                XJSExpressionContainer: ['expression'],
                XJSElement: ['openingElement', 'closingElement', 'children'],
                XJSClosingElement: ['name'],
                XJSOpeningElement: ['name', 'attributes'],
                XJSAttribute: ['name', 'value'],
                XJSSpreadAttribute: ['argument'],
                XJSText: null,
                // Esprima 2.3 introduced handler and kept handlers for back compat which duplicated
                // CatchClause nodes. Can't update estraverse until we
                // replace esprima-harmony-jscs for babel
                // See https://github.com/jquery/esprima/issues/1031
                TryStatement: ['block', 'handlers', 'finalizer']
            }
        });
    }
}
