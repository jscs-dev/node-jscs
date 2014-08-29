var presets = {
    // https://github.com/airbnb/javascript
    airbnb: require('../../presets/airbnb.json'),
    // http://javascript.crockford.com/code.html
    crockford: require('../../presets/crockford.json'),
    // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    google: require('../../presets/google.json'),
    // https://contribute.jquery.org/style-guide/js/
    jquery: require('../../presets/jquery.json'),
    // https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2
    mdcs: require('../../presets/mdcs.json'),
    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    wikimedia: require('../../presets/wikimedia.json'),
    // https://github.com/ymaps/codestyle/blob/master/js.md
    yandex: require('../../presets/yandex.json')
};

module.exports = {
    /**
     * Get does not exist error
     * @param {String} preset
     * @return {String}
     */
    getDoesNotExistError: function(preset) {
        return 'Preset "' + preset + '" does not exist';
    },
    /**
     * Is preset exists in jscs
     * @param {String} preset
     * @return {Boolean}
     */
    exists: function(preset) {
        return !!presets[preset];
    },

    /**
     * Extend jscs config with preset rules
     * @param {Object} config
     * @return {Boolean}
     */
    extend: function(config) {
        if (!config.preset) {
            return true;
        }

        var preset = presets[config.preset];

        if (!preset) {
            return false;
        }

        delete config.preset;
        for (var rule in preset) {
            if (!(rule in config)) {
                config[rule] = preset[rule];
            }
        }

        return true;
    }
};
