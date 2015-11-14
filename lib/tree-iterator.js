var estraverse = require('estraverse');
var VISITOR_KEYS = require('cst').visitorKeys;

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
            keys: VISITOR_KEYS
        });
    }
};
