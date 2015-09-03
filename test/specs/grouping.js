var assert = require('assert');
var fs = require('fs');
var path = require('path');
var groups = require('../../grouping');

var rulesDir = path.join(__dirname, '..', '..', 'lib', 'rules');

describe.skip('rule grouping', function() {
    var lookup = Object.keys(groups).reduce(function(acc, group) {
        groups[group].forEach(function(rule) {
            acc[rule] = group;
        });

        return acc;
    }, {});

    describe('exists for every rule', function() {
        fs.readdirSync(rulesDir).map(function(file) {
            var Rule = require(path.join(rulesDir, file));
            return Rule.prototype.getOptionName.call();
        }).forEach(function(option) {
            it(option, function() {
                assert(lookup[option], 'Add missing group for: ' + option + ' in grouping.json');
            });
        });
    });
});
