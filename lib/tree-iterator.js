var estraverse = require('estraverse');
var assign = require('lodash.assign');
var types = require('babel-core').types;
var keys = assign({

    // Those are deprecated, need to remove it in the future
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
}, types.VISITOR_KEYS, estraverse.VisitorKeys);

module.exports.iterate = function iterate(node, cb) {
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
            keys: keys
        });
    }
};
