var convertDir = require('./convert-dir');
var unconvertedCount = 0;
var cst = require('cst');
var Parser = require('cst').Parser;

var Token = cst.Token;
var Identifier = cst.types.Identifier;
var VariableDeclarator = cst.types.VariableDeclarator;

var calls = {
    isEmpty: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '' : '.no') + '.errors()'
        );
    },

    calledWith: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.been.calledWith(' + element.parentElement.parentElement.arguments.map(function(element) {
                return element.sourceCode;
            }).join(', ') + ')'
        );
    }
};

var properties = {
    called: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '' : '.not') +
            '.callCount(0)'
        );
    },
    notCalled: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.callCount(0)'
        );
    },
    calledOnce: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.callCount(1)'
        );
    },
    calledTwice: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.callCount(2)'
        );
    },
    calledThrice: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.callCount(3)'
        );
    },
    length: function(element, isNegated) {
        return parseExpression(
            'expect(' + element.sourceCode + '.length)' +
            (isNegated ? '.to.equal(0)' : '.to.be.at.least(1)')
        );
    }
};

var callEquals = {
    getErrorCount: function(left, right, isNegated, ruleName) {
        if (right.value === 0) {
            return parseExpression(
                'expect(' + left.sourceCode + ')' +
                '.to.have' + (isNegated ? '' : '.no') + '.errors()'
            );
        } else if (right.value === 1) {
            return parseExpression(
                'expect(' + left.sourceCode + ')' +
                '.to.have' +
                (isNegated ?
                    '.no' + (ruleName ? '.validation' : '') + '.errors' :
                    '.one' + (ruleName ? '.validation' : '') + '.error'
                ) +
                (ruleName ? '.from(\'' + ruleName + '\')' : '()')
            );
        } else {
            return parseExpression(
                'expect(' + left.sourceCode + ')' +
                '.to.have.error.count' + (isNegated ? '.not' : '') +
                '.equal(' + right.sourceCode + ')'
            );
        }
    },
    indexOf: function(left, right, isNegated) {
        var subString = left.parentElement.parentElement.arguments[0];
        if (right.value === 0 && !isNegated) {
            return parseExpression('expect(' + left.sourceCode + ').to.startWith(' + subString.sourceCode + ')');
        }
        if (right.value === -1 && isNegated) {
            return parseExpression('expect(' + left.sourceCode + ').to.have.string(' + subString.sourceCode + ')');
        }
    }
};

var memberEquals = {
    callCount: function(left, right, isNegated) {
        return parseExpression(
            'expect(' + left.sourceCode + ')' +
            '.to.have' + (isNegated ? '.not' : '') +
            '.callCount(' + right.sourceCode + ')'
        );
    }
};

convertDir([__dirname + '/../test/specs', __dirname + '/../test/lib'], function(cst, tools) {
    var relativePath = tools.relativePath;
    var match;
    var ruleName;
    if ((match = relativePath.match(/\/rules\/(.*)\.js$/)) !== null) {
        var RuleClass = require('../lib/rules/' + match[1] + '.js');
        var rule = new RuleClass();
        ruleName = rule.getOptionName();
    }
    cst.selectNodesByType('VariableDeclarator').forEach(function(declarator) {
        if (declarator.id.type === 'Identifier' && declarator.id.name === 'assert') {
            if (
                declarator.init.type === 'CallExpression' &&
                declarator.init.callee.type === 'Identifier' &&
                declarator.init.callee.name === 'require'
            ) {
                var newDeclarator = new VariableDeclarator([
                    new Identifier([new Token('Identifier', 'expect')]),
                    new Token('Whitespace', ' '),
                    new Token('Punctuator', '='),
                    new Token('Whitespace', ' '),
                    parseExpression('require(\'chai\').expect')
                ]);
                declarator.parentElement.replaceChild(newDeclarator, declarator);
            }
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            (callee.type === 'Identifier' && callee.name === 'assert') ||
            (callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'ok')
        ) {
            var arg = expression.arguments[0];
            var errorMessage = expression.arguments[1];
            var isNegated = false;
            var replacement;

            if (arg.type === 'UnaryExpression' && arg.operator === '!') {
                isNegated = true;
                arg = arg.argument;
            }

            if (arg.type === 'MemberExpression' && arg.property.type === 'Identifier') {
                var propertyName = arg.property.name;
                if (properties.hasOwnProperty(propertyName)) {
                    replacement = properties[propertyName](arg.object, isNegated);
                }
            }

            if (
                arg.type === 'CallExpression' &&
                arg.callee.type === 'MemberExpression' &&
                arg.callee.property.type === 'Identifier'
            ) {
                var methodName = arg.callee.property.name;
                if (calls.hasOwnProperty(methodName)) {
                    replacement = calls[methodName](arg.callee.object, isNegated);
                }
            }

            if (arg.type === 'BinaryExpression') {
                if (arg.operator === '===' || arg.operator === '!==') {
                    if (arg.operator === '!==') {
                        isNegated = !isNegated;
                    }

                    replacement = processEquality(arg.left, arg.right, isNegated, ruleName, errorMessage);
                }

                if (arg.operator === 'instanceof') {
                    replacement = parseExpression(
                        'expect(' + arg.left.sourceCode + ')' +
                        '.to.be' + (isNegated ? '.not' : '') +
                        '.an.instanceof(' + arg.right.sourceCode + ')'
                    );
                }

                if (arg.operator === '>') {
                    replacement = parseExpression(
                        'expect(' + arg.left.sourceCode + ')' +
                        '.to.be' + (isNegated ? '.not' : '') +
                        '.above(' + arg.right.sourceCode + ')'
                    )
                }
            }

            if (arg.type === 'Literal' && arg.value === false) {
                replacement = parseStatement(
                    expression.arguments.length > 1 ?
                    'throw ' + errorMessage.sourceCode + ';' :
                    'throw new Error();'
                );
            }

            if (arg.type === 'Literal' && arg.value === true) {
                removeElement(expression.parentElement.previousToken);
                removeElement(expression.parentElement);
                return;
            }

            if (!replacement) {
                var assertExpr = expression.arguments[0];
                if (assertExpr.type === 'UnaryExpression' && assertExpr.operator === '!') {
                    replacement = parseExpression(
                        'expect(' + expression.arguments[0].sourceCode + ').to.equal(true)'
                    );
                } else {
                    var expressionSource = expression.arguments[0].sourceCode;
                    if (
                        expression.arguments[0].type === 'BinaryExpression' ||
                        expression.arguments[0].type === 'LogicalExpression'
                    ) {
                        expressionSource = '(' + expressionSource + ')';
                    }
                    replacement = parseExpression(
                        'expect(!!' + expressionSource + ').to.equal(true)'
                    );
                }
            }

            if (replacement.isStatement) {
                expression.parentElement.parentElement.replaceChild(replacement, expression.parentElement);
            } else {
                replacement = processReplacement(replacement, expression);
                expression.parentElement.replaceChild(replacement, expression);
            }
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            (callee.property.name === 'equal' || callee.property.name === 'strictEqual')
        ) {
            var left = expression.arguments[0];
            var right = expression.arguments[1];
            var errorMessage = expression.arguments[2];

            if (left.type === 'Literal') {
                left = right;
                right = expression.arguments[0];
            }

            var replacement = processEquality(left, right, false, ruleName, errorMessage);

            replacement = processReplacement(replacement, expression);

            expression.parentElement.replaceChild(replacement, expression);
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'notEqual'
        ) {
            var left = expression.arguments[0];
            var right = expression.arguments[1];
            var errorMessage = expression.arguments[2];

            if (left.type === 'Literal') {
                left = right;
                right = expression.arguments[0];
            }
            var replacement = processEquality(left, right, true, ruleName, errorMessage);

            replacement = processReplacement(replacement, expression);

            expression.parentElement.replaceChild(replacement, expression);
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            (callee.property.name === 'throws' || callee.property.name === 'doesNotThrow')
        ) {
            var isNegated = callee.property.name === 'doesNotThrow';
            var func = expression.arguments[0];
            var arg = expression.arguments[1];

            if (arg && arg.sourceCode === 'assert.AssertionError') {
                arg = parseExpression('\'AssertionError\'');
            }

            var replacement = parseExpression(
                'expect(' + func.sourceCode + ').to' +
                (isNegated ? '.not' : '') +
                '.throw(' + (arg ? arg.sourceCode : '') + ')'
            );

            replacement = processReplacement(replacement, expression);

            expression.parentElement.replaceChild(replacement, expression);
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'deepEqual'
        ) {
            var replacement = parseExpression(
                'expect(' + expression.arguments[0].sourceCode + ').to' +
                '.deep.equal(' + (expression.arguments[1].sourceCode) + ')'
            );

            replacement = processReplacement(replacement, expression);

            expression.parentElement.replaceChild(replacement, expression);
        }
    });

    cst.selectNodesByType('CallExpression').forEach(function(expression) {
        var callee = expression.callee;
        if (
            callee.type === 'MemberExpression' &&
            callee.object.type === 'Identifier' &&
            callee.object.name === 'assert' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'fail'
        ) {
            expression.parentElement.parentElement.replaceChild(
                parseStatement('throw new Error(' + expression.arguments[0].sourceCode + ');'),
                expression.parentElement
            );
        }
    });

}).done(function() {
    console.log('Unconverted:', unconvertedCount);
});

function processEquality(left, right, isNegated, ruleName, errorMessage) {
    var replacement;

    if (left.type === 'CallExpression' && left.callee.type === 'MemberExpression') {
        var leftMethodName = left.callee.property.name;
        if (callEquals.hasOwnProperty(leftMethodName)) {
            replacement = callEquals[leftMethodName](left.callee.object, right, isNegated, ruleName, errorMessage);
        }
    }

    if (left.type === 'UnaryExpression' && left.operator === 'typeof') {
        replacement = parseExpression(
            'expect(' + left.argument.sourceCode + ').to.be' +
            (isNegated ? '.not' : '') +
            '.a(' + right.sourceCode + ')'
        );
    }

    if (left.type === 'MemberExpression') {
        var leftMemberName = left.property.name;
        if (memberEquals.hasOwnProperty(leftMemberName)) {
            replacement = memberEquals[leftMemberName](left.object, right, isNegated);
        }
    }

    if (!replacement) {
        replacement = parseExpression(
            'expect(' + left.sourceCode + ')' +
            '.to' + (isNegated ? '.not' : '') +
            '.equal(' + right.sourceCode + (errorMessage ? ', ' + errorMessage.sourceCode : '') + ')'
        );
    }

    return replacement;
}

var parser = new Parser();
function parseExpression(string) {
    try {
        var program = parser.parse('(' + string + ');');
        return program.body[0].expression.cloneElement();
    } catch (e) {
        e.message += ': ' + string;
        throw e;
    }
}

function parseStatement(string) {
    try {
        var program = parser.parse(string);
        return program.body[0].cloneElement();
    } catch (e) {
        e.message += ': ' + string;
        throw e;
    }
}

function processReplacement(replacement, original) {
    var offset = original.loc.start.column;
    if (offset + replacement.loc.end.column >= 120) {
        var element = replacement.callee;
        while (element) {
            if (element.type === 'MemberExpression' && element.property.name === 'to') {
                var dot = element.property.previousCodeToken;
                dot.parentElement.insertChildBefore(new Token(
                    'Whitespace',
                    '\n' + new Array(offset + 3).join(' ')
                ), dot);
                break;
            }
            element = element.object;
        }
    }
    return replacement;
}

function removeElement(element) {
    element.parentElement.removeChild(element);
}
