module.exports = {
	closestScopeNode : closestScopeNode,
    treeIterator     : require('./tree-iterator')
};

var scopeNodeTypes = [
    'Program',
    'FunctionDeclaration',
    'FunctionExpression'
];

/**
 * Search for the closest scope node tree for Node
 * @param {{type: String}} n
 */
function closestScopeNode (n) {
    while (n && scopeNodeTypes.indexOf(n.type) === -1) {
        n = n.parentNode;
    }
    return n;
}
