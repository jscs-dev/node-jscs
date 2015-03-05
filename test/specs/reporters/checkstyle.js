var assert = require('assert');
var sinon = require('sinon');

var parser = require('xml2js').parseString;

var Checker = require('../../../lib/checker');
var checkstyle = require('../../../lib/reporters/checkstyle');

describe('reporters/checkstyle', function() {
    var checker = new Checker();

    checker.registerDefaultRules();
    checker.configure({ disallowKeywords: ['with'] });

    it('should correctly report error results', function(done) {
        var output = '';

        sinon.stub(console, 'log', function(xml) {
            output += xml;
        });

        checkstyle([checker.checkString('with (x) { y++; }')]);

        console.log.restore();

        parser(output, {trim: true}, function(err, result) {
            if (!err) {
                var checkstyle = result.checkstyle;

                assert(!!checkstyle);
                assert(checkstyle.$.version === '4.3');

                var file = checkstyle.file[0];
                assert(!!file);
                assert(file.$.name === 'input');

                var error = file.error[0];
                assert(!!error);
                assert(error.$.line === '1');
                assert(error.$.column === '1');
                assert(error.$.severity === 'error');
                assert(error.$.message === 'Illegal keyword: with');
                assert(error.$.source === 'jscs');
            } else {
                assert(false, err);
            }

            done();
        });
    });
});
