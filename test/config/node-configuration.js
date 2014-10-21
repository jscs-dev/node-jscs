var assert = require('assert');
var NodeConfiguration = require('../../lib/config/node-configuration');

describe('modules/config/node-configuration', function() {

    var configuration;
    beforeEach(function() {
        configuration = new NodeConfiguration();
    });

    describe('constructor', function() {
        it('should set default base path to process.cwd()', function() {
            assert(configuration.getBasePath() === process.cwd());
        });
    });
});
