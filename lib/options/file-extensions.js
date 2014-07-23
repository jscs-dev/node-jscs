var DEFAULT_FILE_EXTENSIONS = ['.js'];

module.exports = function(config, instance) {
    if (typeof config.fileExtensions === 'string') {
        instance._fileExtensions = [config.fileExtensions.toLowerCase()];
    } else if (Array.isArray(config.fileExtensions)) {
        instance._fileExtensions = config.fileExtensions.map(
            function(s) {
                return s.toLowerCase();
            }
        );
    } else {
        instance._fileExtensions = DEFAULT_FILE_EXTENSIONS;
    }

    Object.defineProperty(config, 'fileExtensions', {
        value: config.fileExtensions,
        enumerable: false
    });
};
