var DEFAULT_FILE_EXTENSIONS = ['.js'];

module.exports = function(config, instance) {
    if (config.fileExtensions) {
        instance._fileExtensions = config.fileExtensions.map(
            function(s) {
                return s.toLowerCase();
            }
        );
    } else {
        instance._fileExtensions = DEFAULT_FILE_EXTENSIONS;
    }
    delete config.fileExtensions;
};
