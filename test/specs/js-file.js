var fs = require('fs');

var expect = require('chai').expect;
var sinon = require('sinon');

var assign = require('lodash').assign;

var JsFile = require('../../lib/js-file');

describe('js-file', function() {

    function createJsFile(sources, options) {
        var params = {
            filename: 'example.js',
            source: sources
        };

        return new JsFile(assign(params, options));
    }

    describe('constructor', function() {

        it('empty file should have one token EOF', function() {
            var file = new JsFile({filename: 'example.js', source: ''});
            expect(file.getTree().getFirstToken().type).to.equal('EOF');
        });

        it('should accept broken JS file', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: '/1'
            });

            expect(file.getParseErrors()).to.be.an('array');
            expect(file.getTree()).to.be.an('object');
        });

        it('should handle parse errors', function() {
            var file = new JsFile({
                filename: 'input',
                source: '\n2++;'
            });
            expect(file.getParseErrors().length).to.equal(1);
            var parseError = file.getParseErrors()[0];

            expect(parseError.message).to.equal('Assigning to rvalue (2:0)');
            expect(parseError.pos).to.equal(1);
            expect(parseError.loc).to.be.an('object');
            expect(parseError.loc.line).to.equal(2);
            expect(parseError.loc.column).to.equal(0);
        });
    });

    describe('iterateNodesByType', function() {
        it('should handle ES6 export keyword', function() {
            var spy = sinon.spy();
            createJsFile('export function foo() { var a = "b"; };')
                .iterateNodesByType('VariableDeclaration', spy);
            expect(spy).to.have.callCount(1);
        });
    });

    describe('findNextToken', function() {
        var file;

        beforeEach(function() {
            file = createJsFile('switch(varName){case"yes":a++;break;}');
        });

        it('should find the first next token when only the type is specified', function() {
            var switchToken = file.getTree().getFirstToken();
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier');
            expect(nextToken.type).to.equal('Identifier');
            expect(nextToken.value).to.equal('varName');

            nextToken = file.findNextToken(switchToken, 'Keyword');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('case');

            nextToken = file.findNextToken(switchToken, 'Punctuator');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('(');
        });

        it('should find the first next token when both type and value are specified', function() {
            var switchToken = file.getTree().getFirstToken();
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier', 'varName');
            expect(nextToken.type).to.equal('Identifier');
            expect(nextToken.value).to.equal('varName');

            nextToken = file.findNextToken(switchToken, 'Keyword', 'case');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('case');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '(');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('(');
        });

        it('should find the correct next token when both type and value are specified', function() {
            var switchToken = file.getTree().getFirstToken();
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'break');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('break');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '{');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('{');

            nextToken = file.findNextToken(switchToken, 'Punctuator', ':');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal(':');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '}');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('}');
        });

        it('should not find any token if it does not exist', function() {
            var switchToken = file.getTree().getFirstToken();
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'if');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Numeric');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Boolean');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Null');
            expect(nextToken).to.equal(null);
        });
    });

    describe('findPrevToken', function() {
        var file;

        beforeEach(function() {
            file = createJsFile('switch(varName){case"yes":a++;break;}');
        });

        it('should find the first previous token when only the type is specified', function() {
            var lastToken = file.getTree().getLastToken();
            expect(lastToken.type).to.equal('EOF');

            var previousToken = file.findPrevToken(lastToken, 'Punctuator');
            var firstPunctuator = previousToken;
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('}');

            previousToken = file.findPrevToken(lastToken, 'Identifier');
            expect(previousToken.type).to.equal('Identifier');
            expect(previousToken.value).to.equal('a');

            previousToken = file.findPrevToken(lastToken, 'Keyword');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('break');

            previousToken = file.findPrevToken(firstPunctuator, 'Punctuator');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(';');
        });

        it('should find the first previous token when both type and value are specified', function() {
            var lastToken = file.getTree().getLastToken().getPreviousToken();

            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Identifier', 'a');
            expect(previousToken.type).to.equal('Identifier');
            expect(previousToken.value).to.equal('a');

            previousToken = file.findPrevToken(lastToken, 'Keyword', 'break');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('break');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ';');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(';');
        });

        it('should find the correct previous token when both type and value are specified', function() {
            var lastToken = file.getTree().getLastToken().getPreviousToken();
            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'case');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('case');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '{');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('{');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ':');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(':');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '(');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('(');
        });

        it('should not find any token if it does not exist', function() {
            var lastToken = file.getTree().getLastToken().getPreviousToken();
            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'if');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Numeric');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Boolean');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Null');
            expect(previousToken).to.equal(null);
        });

        it('should find prev token', function() {
            file = createJsFile('if (true);');

            var lastToken = file.getTree().getLastToken();
            var trueToken = file.findPrevToken(lastToken, 'Boolean');

            expect(trueToken.type).to.equal('Boolean');
            expect(trueToken.value).to.equal(true);

            var ifToken = file.findPrevToken(trueToken, 'Keyword');
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            ifToken = file.findPrevToken(trueToken, 'Keyword', 'if');
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');
        });
    });

    describe('findNextOperatorToken', function() {
        it('should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTree().getFirstToken(), '=');

            expect(token.type).to.equal('Punctuator');
            expect(token.value).to.equal('=');
            expect(token.getRange()[0]).to.equal(2);
        });

        it('should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findNextOperatorToken(file.getTree().getFirstToken(), 'instanceof');
            expect(token.type).to.equal('Keyword');
            expect(token.value).to.equal('instanceof');
            expect(token.getRange()[0]).to.equal(2);
        });

        it('should return null for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTree().getFirstToken(), '-');
            expect(token).to.equal(null);
        });
    });

    describe('findPrevOperatorToken', function() {
        it('should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTree().getLastToken(), '=');
            expect(token.type).to.equal('Punctuator');
            expect(token.value).to.equal('=');
            expect(token.getRange()[0]).to.equal(2);
        });

        it('should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findPrevOperatorToken(file.getTree().getLastToken(), 'instanceof');
            expect(token.type).to.equal('Keyword');
            expect(token.value).to.equal('instanceof');
            expect(token.getRange()[0]).to.equal(2);
        });

        it('should return null for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTree().getLastToken(), '-');
            expect(token).to.equal(null);
        });
    });

    describe('getFirstNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstNodeToken(file.getNodesByType('IfStatement')[0]);
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            var incToken = file.getFirstNodeToken(file.getNodesByType('UpdateExpression')[0]);
            expect(incToken.type).to.equal('Identifier');
            expect(incToken.value).to.equal('x');
        });
    });

    describe('getLastNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getLastNodeToken(file.getNodesByType('IfStatement')[0]);
            expect(ifToken.type).to.equal('Punctuator');
            expect(ifToken.value).to.equal('}');

            var incToken = file.getLastNodeToken(file.getNodesByType('UpdateExpression')[0]);
            expect(incToken.type).to.equal('Punctuator');
            expect(incToken.value).to.equal('++');
        });
    });

    describe('getFirstToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstToken({includeComments: true});
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');
        });
    });

    describe('getLastToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var EOFToken = file.getLastToken({includeComments: true});
            expect(EOFToken.type).to.equal('EOF');
        });
    });

    describe('getNodesByType', function() {
        it('should return nodes using specified type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Identifier');
            expect(nodes.length).to.equal(2);
            expect(nodes[0].type).to.equal('Identifier');
            expect(nodes[0].name).to.equal('x');
            expect(nodes[1].type).to.equal('Identifier');
            expect(nodes[1].name).to.equal('y');
        });

        it('should return empty array for non-existing type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Literal');
            expect(nodes.length).to.equal(0);
        });

        it('should accept array as an argument', function() {
            var nodes = createJsFile('x += 1;').getNodesByType(['Identifier', 'NumericLiteral']);
            expect(nodes.length).to.equal(2);
            expect(nodes[0].type).to.equal('Identifier');
            expect(nodes[0].name).to.equal('x');
            expect(nodes[1].type).to.equal('NumericLiteral');
            expect(nodes[1].value).to.equal(1);
        });

        it('should return empty array for non-existing type array', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType(['Literal', 'BinaryExpression']);
            expect(nodes.length).to.equal(0);
        });
    });

    describe('getLastTokenOnLine', function() {
        it('should return last line token', function() {
            var file = createJsFile('x = 1;\nif (x) {}\n');
            var xToken = file.getLastTokenOnLine(1);
            expect(xToken.type).to.equal('Punctuator');
            expect(xToken.value).to.equal(';');
            var ifToken = file.getLastTokenOnLine(2);
            expect(ifToken.type).to.equal('Punctuator');
            expect(ifToken.value).to.equal('}');
        });

        it('should return whitespace token', function() {
            expect(createJsFile('\n\n ').getLastTokenOnLine(1, {
                includeWhitespace: true
            }).type).to.equal('Whitespace');
        });

        it('should return null if no token was found', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1);
            expect(noToken).to.equal(null);
        });

        it('should return null if only comment was found', function() {
            var file = createJsFile('\t\tx += 1;\n/*123*/\n');
            var noToken = file.getLastTokenOnLine(2);
            expect(noToken).to.equal(null);
        });

        it('should return last line token ignoring comments', function() {
            var file = createJsFile('x = 1; /* 321 */\n');
            var xToken = file.getLastTokenOnLine(1);
            expect(xToken.type).to.equal('Punctuator');
            expect(xToken.value).to.equal(';');
        });

        it('should return last line token including comments', function() {
            var file = createJsFile('x = 1; /*123*/\n');
            var commentToken = file.getLastTokenOnLine(1, {includeComments: true});
            expect(!!commentToken.isComment).to.equal(true);
            expect(commentToken.type).to.equal('CommentBlock');
            expect(commentToken.value).to.equal('123');
        });

        it('should return null if no token was found including comments', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1, {includeComments: true});
            expect(noToken).to.equal(null);
        });
    });

    describe('iterate', function() {
        it('should iterate all nodes in the document', function() {
            var file = createJsFile('x++;');

            var spy = sinon.spy();
            file.iterate(spy);

            expect(spy).to.have.callCount(4);

            expect(spy.getCall(0).args[0].type).to.equal('Program');
            expect(spy.getCall(1).args[0].type).to.equal('ExpressionStatement');
            expect(spy.getCall(2).args[0].type).to.equal('UpdateExpression');
            expect(spy.getCall(3).args[0].type).to.equal('Identifier');
        });

        it('should iterate nested nodes', function() {
            var file = createJsFile('x = (5 + 4) && (3 + 1);');

            var spy = sinon.spy();
            file.iterate(spy, file.getNodesByType('LogicalExpression')[0].left);

            expect(spy).to.have.callCount(3);
            expect(spy.getCall(0).args[0].type).to.equal('BinaryExpression');
            expect(spy.getCall(1).args[0].type).to.equal('NumericLiteral');
            expect(spy.getCall(1).args[0].value).to.equal(5);
            expect(spy.getCall(2).args[0].type).to.equal('NumericLiteral');
            expect(spy.getCall(2).args[0].value).to.equal(4);
        });
    });

    describe('iterateNodesByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('Identifier', spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].name).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Identifier');
            expect(spy.getCall(1).args[0].name).to.equal('y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('NumericLiteral', spy);
            expect(spy).to.have.callCount(0);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateNodesByType(['Identifier', 'NumericLiteral'], spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].name).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('NumericLiteral');
            expect(spy.getCall(1).args[0].value).to.equal(1);
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType(['NumericLiteral', 'BinaryExpression'], spy);
            expect(spy).to.have.callCount(0);
        });
    });

    describe('iterateTokensByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Identifier', spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].value).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Identifier');
            expect(spy.getCall(1).args[0].value).to.equal('y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Boolean', spy);
            expect(spy).to.have.callCount(0);
        });

        it('should apply callback for line comments', function() {
            var spy = sinon.spy();
            createJsFile('//foo').iterateTokensByType('CommentLine', spy);
            expect(spy).to.have.callCount(1);
        });

        it('should apply callback for block comments', function() {
            var spy = sinon.spy();
            createJsFile('/*foo*/').iterateTokensByType('CommentBlock', spy);
            expect(spy).to.have.callCount(1);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateTokensByType(['Identifier', 'Numeric'], spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].value).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal(1);
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType(['Boolean', 'Numeric'], spy);
            expect(spy).to.have.callCount(0);
        });
    });

    describe('getTree', function() {
        it('should return empty token tree for non-existing AST-tree', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld'});
            expect(file.getTree()).to.be.a('object');
            expect(file.getTree()).to.not.equal(null);
        });
    });

    describe('getSource', function() {
        it('should return specified source code', function() {
            var sources = 'var x = 1;\nvar y = 2;';
            var file = createJsFile(sources);
            expect(file.getSource()).to.equal(sources);
        });
    });

    describe('getDialect', function() {
        var sources = 'var x = 1;\nvar y = 2;';

        it('should return es6 with no options specified', function() {
            var file = createJsFile(sources);
            expect(file.getDialect()).to.equal('es6');
        });

        it('should return es3 when es3 is specified as true', function() {
            var file = createJsFile(sources, {es3: true});
            expect(file.getDialect()).to.equal('es3');
        });

        it('should return es6 when es3 is specified as false', function() {
            var file = createJsFile(sources, {es3: false});
            expect(file.getDialect()).to.equal('es6');
        });
    });

    describe('getLines', function() {
        it('should return specified source code lines', function() {
            var sources = ['var x = 1;', 'var y = 2;'];
            var file = createJsFile(sources.join('\n'));
            expect(file.getLines().length).to.equal(2);
            expect(file.getLines()[0]).to.equal(sources[0]);
            expect(file.getLines()[1]).to.equal(sources[1]);
        });

        it('should accept all line endings', function() {
            var lineEndings = ['\r\n', '\r', '\n'];

            lineEndings.forEach(function(lineEnding) {
                var sources = ['var x = 1;', 'var y = 2;'];
                var file = createJsFile(sources.join(lineEnding));
                expect(file.getLines().length).to.equal(2);
                expect(file.getLines()[0]).to.equal(sources[0]);
                expect(file.getLines()[1]).to.equal(sources[1]);
            });
        });
    });

    describe('getScope', function() {
        it('should lazy initialize', function() {
            var sources = ['var x = 1;', 'var y = 2;'];
            var file = createJsFile(sources.join('\n'));
            expect(file._scopes).to.equal(null);

            expect(file.getScopes()).to.be.a('object');
            expect(file._scopes).to.be.not.a('null');
        });

        it('should ignore eval', function(done) {
            var sources = ['function f(options) { return options; eval(); }'];
            var file = createJsFile(sources.join('\n'));

            file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
                expect(file.getScopes().acquire(node).getVariables()[0].getReferences().length).to.equal(1);
                done();
            });
        });
    });

    describe('getLinesWithCommentsRemoved', function() {
        it('should strip line comments', function() {
            var source = 'a++; //comment\n//comment';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(2);
            expect(lines[0]).to.equal('a++; ');
            expect(lines[1]).to.equal('');
        });

        it('should strip single-line block comments', function() {
            var source = 'a++;/*comment*/b++;\n/*comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(2);
            expect(lines[0]).to.equal('a++;b++;');
            expect(lines[1]).to.equal('');
        });

        it('should strip multi-line block comments', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(3);
            expect(lines[0]).to.equal('a++;');
            expect(lines[1]).to.equal('');
            expect(lines[2]).to.equal('');
        });

        it('should strip an multi-line block comments with trailing tokens', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/b++;';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(3);
            expect(lines[0]).to.equal('a++;');
            expect(lines[1]).to.equal('');
            expect(lines[2]).to.equal('b++;');
        });

        it('should preserve comment order', function() {
            var source = '//comment1\n//comment2';
            var file = createJsFile(source);

            file.getLinesWithCommentsRemoved();
            expect(file.getComments()[0].value).to.equal('comment1');
            expect(file.getComments()[1].value).to.equal('comment2');
        });

        it('should remove left tralling spaces', function() {
            var source = '/* bar */ false';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines[0]).to.equal('false');
        });
    });

    describe('getFilename', function() {
        it('should return given filename', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: 'Hello\nWorld'
            });
            expect(file.getFilename()).to.equal('example.js');
        });
    });

    describe('render', function() {
        var relativeDirPath = '../data/render';
        var absDirPath = __dirname + '/' + relativeDirPath;
        fs.readdirSync(absDirPath).forEach(function(filename) {
            it('file ' + relativeDirPath + '/' + filename + ' should be rendered correctly', function() {
                var source = fs.readFileSync(absDirPath + '/' + filename, 'utf8');
                var file = createJsFile(source);
                expect(file.render()).to.equal(source);
            });
        });
    });

    describe('getLineBreaks', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld'});
            expect(file.getLineBreaks()).to.deep.equal(['\n']);
        });

        it('should return empty array for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello'});
            expect(file.getLineBreaks()).to.deep.equal([]);
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld'});
            expect(file.getLineBreaks()).to.deep.equal(['\r']);
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld'});
            expect(file.getLineBreaks()).to.deep.equal(['\r\n']);
        });
    });

    describe('getLineBreakStyle', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld'});
            expect(file.getLineBreakStyle()).to.equal('\n');
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld'});
            expect(file.getLineBreakStyle()).to.equal('\r');
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld'});
            expect(file.getLineBreakStyle()).to.equal('\r\n');
        });

        it('should return \\n for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello'});
            expect(file.getLineBreakStyle()).to.equal('\n');
        });

        it('should return first line break for mixed file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld\r\n!'});
            expect(file.getLineBreakStyle()).to.equal(file.getLineBreaks()[0]);
        });
    });

    describe('getNextToken', function() {
        it('should return next token', function() {
            var file = createJsFile('x++');
            var xToken = file.getTree().getFirstToken();
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var next = file.getNextToken(xToken);
            expect(next.type).to.equal('Punctuator');
            expect(next.value).to.equal('++');
        });

        it('should return EOF token', function() {
            var file = createJsFile('x');
            var xToken = file.getTree().getFirstToken();
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var next = file.getNextToken(xToken);
            expect(next.type).to.equal('EOF');
            expect(next.value).to.equal('');
        });

        it('should return null for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTree().getFirstToken();
            var next = file.getNextToken(file.getNextToken(xToken));
            expect(next).to.equal(null);
        });

        it('should ignore comments', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTree().getFirstToken();
            var next = file.getNextToken(xToken, {includeComments: false});
            expect(next.type).to.equal('EOF');
            expect(next.value).to.equal('');
        });

        it('should return next comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTree().getFirstToken();
            var next = file.getNextToken(xToken, {includeComments: true});
            expect(next.type).to.equal('CommentBlock');
        });

        it('should return EOF next to comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getComments()[0];
            var next = file.getNextToken(xToken, {includeComments: true});
            expect(next.type).to.equal('EOF');
        });

        it('should return null if there is where to go', function() {
            var file = createJsFile('x');
            var xToken = file.getTree().getLastToken();
            var next = file.getNextToken(xToken);
            expect(next).to.equal(null);
        });
    });

    describe('getPrevToken', function() {
        it('should return previous token', function() {
            var file = createJsFile('++x');
            var xToken = file.getTree().getLastToken();
            var prev = file.getPrevToken(xToken);

            expect(prev.type).to.equal('Identifier');
            expect(prev.value).to.equal('x');
        });

        it('should return previous non-whitespace token', function() {
            var file = createJsFile('++x ');
            var xToken = file.getTree().getLastToken();
            var prev = file.getPrevToken(xToken);

            expect(prev.type).to.equal('Identifier');
            expect(prev.value).to.equal('x');
        });

        it('should return null for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTree().getFirstToken();
            var prev = file.getPrevToken(xToken);

            expect(prev).to.equal(null);
        });

        it('should ignore comments', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTree().getFirstToken();
            var prev = file.getPrevToken(xToken, {includeComments: false});
            expect(prev).to.equal(null);
        });

        it('should return previous comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTree().getFirstToken().getNextToken();
            var prev = file.getPrevToken(xToken, {includeComments: true});
            expect(prev.type).to.equal('CommentBlock');
        });

        it('should return null prev to comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getComments()[0];
            var prev = file.getPrevToken(xToken, {includeComments: true});
            expect(prev).to.equal(null);
        });

        it('should return null if there is where to go', function() {
            var file = createJsFile('x');
            var xToken = file.getTree().getFirstToken();
            var prev = file.getPrevToken(xToken);
            expect(prev).to.equal(null);
        });
    });

    describe('iterateTokensByTypeAndValue', function() {
        it('should match specified type', function() {
            var file = createJsFile('var x = 1 + 1; /*1*/ //1');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', '1', spy);

            expect(spy).to.have.callCount(2);

            expect(spy.getCall(0).args[0].type).to.equal('Numeric');
            expect(spy.getCall(0).args[0].value).to.equal(1);
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal(1);
        });

        it('should accept value list', function() {
            var file = createJsFile('var x = 1 + 2 + "2"; /*1*/ //2');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', ['1', '2'], spy);

            expect(spy).to.have.callCount(2);

            expect(spy.getCall(0).args[0].type).to.equal('Numeric');
            expect(spy.getCall(0).args[0].value).to.equal(1);
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal(2);
        });
    });

    describe('getWhitespaceBefore', function() {
        it('should return whitespace before the first token', function() {
            var file = createJsFile('  \nx');
            expect(file.getWhitespaceBefore(file.getLastToken().getPreviousToken())).to.equal('  \n');
        });

        it('should not jump through tokens to find a whitespaces', function() {
            var file = createJsFile('  \nx');
            expect(file.getWhitespaceBefore(file.getLastToken())).to.equal('');
        });

        it('should return whitespace before the EOF', function() {
            var file = createJsFile('\n  ');
            expect(file.getWhitespaceBefore(file.getLastToken())).to.equal('\n  ');
        });

        it('should return empty for tokens without whitespace before', function() {
            var file = createJsFile('x');
            expect(file.getWhitespaceBefore(file.getFirstToken())).to.equal('');
        });
    });

    describe('setWhitespaceBefore', function() {
        it('should insert new whitespace token', function() {
            var file = createJsFile('x');
            file.setWhitespaceBefore(file.getFirstToken(), ' ');
            expect(file.render()).to.equal(' x');
        });

        it('should insert new whitespace token between peer tokens', function() {
            var file = createJsFile('x=1');
            file.setWhitespaceBefore(file.getFirstToken().getNextToken(), ' ');
            expect(file.render()).to.equal('x =1');
        });

        it('should alter existing whitespace token', function() {
            var file = createJsFile('  x');
            file.setWhitespaceBefore(file.getLastToken().getPreviousToken(), '\n');
            expect(file.render()).to.equal('\nx');
        });

        it('should drop whitespace token', function() {
            var file = createJsFile('  x');
            file.setWhitespaceBefore(file.getLastToken().getPreviousToken(), '');
            expect(file.render()).to.equal('x');
        });

        it('should ignore already absent whitespace token', function() {
            var file = createJsFile('x');
            file.setWhitespaceBefore(file.getFirstToken(), '');
            expect(file.render()).to.equal('x');
        });

        it('should replace another whitespace token', function() {
            var file = createJsFile('x  = 1');

            file.setWhitespaceBefore(file.findNextToken(file.getFirstToken(), 'Punctuator', '='), ' ');
            expect(file.render()).to.equal('x = 1');
        });
    });
});
