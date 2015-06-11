var estraverse = require('estraverse');

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
                XJSText: null
            }
        });
    }
}
