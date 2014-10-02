/**
 * Limits the total number of errors reported
 *
 * @param  {Object} config
 * @param  {lib/checker} instance
 */
module.exports = function(config, instance) {
    Object.defineProperty(config, 'maxErrors', {
        value: Number(config.maxErrors),
        enumerable: false
    });
};
