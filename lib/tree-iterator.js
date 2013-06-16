module.exports = {
    iterate: iterate
};

var iterableProperties = {
    'body': true,
    'expression': true,

    // if
    'test': true,
    'consequent': true,
    'alternate': true,

    'object': true,

    //switch
    'discriminant': true,
    'cases': true,

    // return
    'argument': true,
    'arguments': true,

    // catch
    'handler': true,

    // for
    'init': true,
    'update': true,

    // for in
    'left': true,
    'right': true,

    // var
    'declarations': true,

    // array
    'elements': true,

    // object
    'properties': true,
    'key': true,
    'value': true,

    // new
    'callee': true,

    // xxx.yyy
    'property': true
};

function iterate(node, cb) {
    var nodesToIterate = [node];
    var currentNode;
    while (!!(currentNode = nodesToIterate.shift())) {
        cb(currentNode);
        for (var i in currentNode) {
            if (iterableProperties[i]) {
                var contents = currentNode[i];
                if (typeof contents === 'object') {
                    nodesToIterate = nodesToIterate.concat(contents);
                }
            }
        }
    }
}
