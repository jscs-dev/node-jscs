var expect = require('chai').expect;
var sinon = require('sinon');

var parser = require('xml2js').parseString;

var Checker = require('../../../lib/checker');
var checkstyle = require('../../../lib/reporters/checkstyle');

describe('reporters/checkstyle', function() {
    it('should correctly report error results', function(done) {
        var checker = new Checker();

        checker.registerDefaultRules();
        checker.configure({ disallowKeywords: ['with'] });

        var output = '';

        sinon.stub(console, 'log', function(xml) {
            output += xml;
        });

        checkstyle([checker.checkString('with (x) { y++; }')]);

        console.log.restore();

        parser(output, {trim: true}, function(err, result) {
            if (!err) {
                var checkstyle = result.checkstyle;

                expect(!!checkstyle).to.equal(true);
                expect(checkstyle.$.version).to.equal('4.3');

                var file = checkstyle.file[0];
                expect(!!file).to.equal(true);
                expect(file.$.name).to.equal('input');

                var error = file.error[0];
                expect(!!error).to.equal(true);
                expect(error.$.line).to.equal('1');
                expect(error.$.column).to.equal('3');
                expect(error.$.severity).to.equal('error');
                expect(error.$.message).to.equal('disallowKeywords: Illegal keyword: with');
                expect(error.$.source).to.equal('jscs');
            } else {
                throw err;
            }

            done();
        });
    });
});
