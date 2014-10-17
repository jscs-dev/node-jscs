module.exports = function(config) {
    Object.defineProperty(config, 'esnext', {
        value: !!config.esnext,
        enumerable: false
    });
};
