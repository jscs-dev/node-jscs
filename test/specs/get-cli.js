var expect = require('chai').expect;
var path = require('path');

var sinon = require('sinon');

describe('get-cli', function() {
    describe('local with global load', function() {
        function delCache() {
            delete require.cache[path.resolve(__dirname, '../../lib/get-cli.js')];
        }

        beforeEach(delCache);
        afterEach(delCache);

        it('should load "global" version of jscs', function() {
            var p = path.resolve(__dirname, '../../lib/get-cli.js');

            expect(!require(p).test).to.equal(true);
        });

        it('should load local version of "jscs"', function() {
            sinon.stub(process, 'cwd', function() {
                return path.resolve(__dirname, '../data/cli/modules');
            });

            expect(!!require('../../lib/get-cli.js').test).to.equal(true);

            process.cwd.restore();
        });
    });
});
