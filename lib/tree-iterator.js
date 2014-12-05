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

    // try
    'block': true,
    'guardedHandlers': true,
    'handlers': true,
    'finalizer': true,

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
    'value': true,

    // new
    'callee': true,

    // xxx.yyy
    'property': true,

    // sequence expression: (x, y)
    'expressions': true,

    // ES6 comprehension blocks: [x for (x of y)]
    'blocks': true,

    // ES6 tagged template string: raw`string`
    'quasi': true,

    // ES6 export: export function(){};
    'declaration': true,

    // ES6 defaults: function(a = 1){};
    'defaults': true,

    // ES6 superclass: class X extends Y {}
    'superClass': true
};

function iterate(node, cb, parentNode, parentCollection) {
    if (cb(node, parentNode, parentCollection) === false) {
        return;
    }

    for (var propName in node) {
        if (node.hasOwnProperty(propName)) {
            if (iterableProperties[propName]) {
                var contents = node[propName];
                var nodeList = Array.isArray(contents) ? contents : [contents];
                for (var i = 0, l = nodeList.length; i < l; i++) {
                    var subNode = nodeList[i];
                    if (typeof subNode === 'object' && subNode !== null && 'type' in subNode) {
                        iterate(nodeList[i], cb, node, nodeList);
                    }
                }
            }
        }
    }
}
