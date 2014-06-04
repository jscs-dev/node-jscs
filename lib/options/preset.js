var presets = {
    // https://contribute.jquery.org/style-guide/js/
    jquery: require('../../presets/jquery.json'),
    // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    google: require('../../presets/google.json'),
    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    wikimedia: require('../../presets/wikimedia.json')
};

module.exports = function(config) {
    if (!config.preset) {
        return;
    }

    var preset = presets[config.preset];

    delete config.preset;
    for (var rule in preset) {
        if (!(rule in config)) {
            config[rule] = preset[rule];
        }
    }
};
