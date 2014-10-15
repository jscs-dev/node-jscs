/**
 * Limits the total number of errors reported
 *
 * @param {Object} config
 * @param {StringСhecker} instance
 */
module.exports = function(config, instance) {
    instance._maxErrors = Number(config.maxErrors);

    Object.defineProperty(config, 'maxErrors', {
        value: Number(config.maxErrors),
        enumerable: false
    });
};
