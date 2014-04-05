var doctrineParser = require('doctrine');

module.exports = {
    parseComments : jsDocParseComments,

    parse : jsDocParseType,
    match : jsDocMatchType
};

function jsDocParseComments (comments) {

    /**
     * metaobject for parsing jsdoc comments string
     */
    return {
        node: getJsDocForNode,
        line: getJsDocForLine
    };

    function getJsDocForNode (node) {
        return getJsDocForLine(node.loc.start.line);
    }

    function getJsDocForLine (line) {
        line--;
        for (var i = 0, l = comments.length; i < l; i++) {
            var comment = comments[i];
            if (comment.loc.end.line === line && comment.type === 'Block' && comment.value.charAt(0) === '*') {
                return comment;
            }
        }
        return null;
    }
}

/**
 * Parses jsDoc string
 * @param {String} typeString
 * @return {?Array.<SimplifiedType>} - parsed jsdoctype string as array
 */
function jsDocParseType (typeString) {
    var node;

    try {
        node = jsDocSimplifyNode(doctrineParser.parseType(typeString));
    } catch (e) {
        node = [];
        node.invalid = true;
    }

    return node;
}

/**
 * Converts AST jsDoc node to simple object
 * @param {Object} node
 * @returns {!(SimplifiedType[])}
 */
function jsDocSimplifyNode (node) {
    var result;

    switch (node.type) {

    case 'NullableType':
    case 'NonNullableType':
        result = jsDocSimplifyNode (node.expression);
        result.nullable = (node.type === 'NullableType');
        return result;

    case 'UnionType':
        result = [];
        for (var i = 0, l = node.elements.length; i < l; i += 1) {
            result.push(jsDocSimplifyNode(node.elements[i]));
        }
        break;

    case 'TypeApplication':
        result = {type: node.expression.name, native: true};
        break;

    case 'NameExpression':
        result = {type: node.name};
        break;

    case 'RecordType':
        result = {type: 'Object', native: true};
        break;

    case 'FunctionType':
        result = {type: 'Function', native: true};
        break;

    // unused
    case 'FieldType':
        break;

    default:
        result = {type: 'Object', unknown: true};
        break;

    }

    if (!Array.isArray(result)) {
        result = [result];
    }

    return result;
}

/**
 * Compare parsed jsDocTypes with esprima node
 * @param {SimplifiedType[]} variants - result of jsDocParseType
 * @param {Object} argument - esprima source code node
 */
function jsDocMatchType (variants, argument) {
    var i, l, variant, type;

    for (i = 0, l = variants.length; i < l; i += 1) {
        variant = variants[i];
        type = variant.type.toLowerCase();

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
    }

    // variables, expressions, another behavior
    return true;
}
