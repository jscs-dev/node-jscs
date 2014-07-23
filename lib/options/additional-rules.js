var path = require('path');
var glob = require('glob');

module.exports = function(config, instance, cwd) {
    (config.additionalRules || []).forEach(function(pattern) {
        glob.sync(path.resolve(cwd, pattern)).map(function(path) {
            var Rule = require(path);
            instance.registerRule(new Rule());
        });
    });

    Object.defineProperty(config, 'additionalRules', {
        value: config.additionalRules,
        enumerable: false
    });
};
