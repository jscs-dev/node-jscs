var assert = require('assert');
var path = require('path');
var minimatch = require('minimatch');

var BUILTIN_OPTIONS = {
    plugins: true,
    preset: true,
    excludeFiles: true,
    additionalRules: true,
    fileExtensions: true,
    maxErrors: true,
    configPath: true
};

/**
 * JSCS Configuration.
 * Browser/Rhino-compatible.
 *
 * @name Configuration
 */
function Configuration() {
    this._presets = {};
    this._rules = {};
    this._configuredRules = [];
    this._fileExtensions = ['.js'];
    this._excludedFileMasks = [];
    this._excludedFileMatchers = [];
    this._ruleSettings = {};
    this._maxErrors = null;
    this._basePath = '.';
    this._overrides = {};
    this._presetName = null;
}

/**
 * Load settings from a configuration.
 *
 * @param {Object} config
 */
Configuration.prototype.load = function(config) {
    this._throwNonCamelCaseErrorIfNeeded(config);

    var overrides = this._overrides;
    var currentConfig = {};
    Object.keys(config).forEach(function(key) {
        currentConfig[key] = config[key];
    });
    Object.keys(overrides).forEach(function(key) {
        currentConfig[key] = overrides[key];
    });

    var ruleSettings = this._processConfig(currentConfig);
    var processedSettings = {};
    var unsupportedRules = [];
    Object.keys(ruleSettings).forEach(function(optionName) {
        var rule = this._rules[optionName];
        if (rule) {
            var optionValue = ruleSettings[optionName];
            if (optionValue !== null) {
                rule.configure(ruleSettings[optionName]);
                this._configuredRules.push(rule);
                processedSettings[optionName] = ruleSettings[optionName];
            }
        } else {
            unsupportedRules.push(optionName);
        }
    }, this);
    if (unsupportedRules.length > 0) {
        throw new Error('Unsupported rules: ' + unsupportedRules.join(', '));
    }
    this._ruleSettings = processedSettings;
};

Configuration.prototype.getProcessedConfig = function() {
    var result = {};
    Object.keys(this._ruleSettings).forEach(function(key) {
        result[key] = this._ruleSettings[key];
    }, this);
    result.excludeFiles = this._excludedFileMasks;
    result.fileExtensions = this._fileExtensions;
    result.maxErrors = this._maxErrors;
    result.preset = this._presetName;
    return result;
};

/**
 * Returns list of configured rules.
 *
 * @returns {Rule[]}
 */
Configuration.prototype.getConfiguredRules = function() {
    return this._configuredRules;
};

/**
 * Returns excluded file mask list.
 *
 * @returns {String[]}
 */
Configuration.prototype.getExcludedFileMasks = function() {
    return this._excludedFileMasks;
};

/**
 * Returns `true` if specified file path is excluded.
 *
 * @param {String} filePath
 * @returns {Boolean}
 */
Configuration.prototype.isFileExcluded = function(filePath) {
    filePath = path.resolve(filePath);
    return this._excludedFileMatchers.some(function(matcher) {
        return matcher.match(filePath);
    });
};

/**
 * Returns file extension list.
 *
 * @returns {String[]}
 */
Configuration.prototype.getFileExtensions = function() {
    return this._fileExtensions;
};

/**
 * Returns maximal error count.
 *
 * @returns {Number|undefined}
 */
Configuration.prototype.getMaxErrors = function() {
    return this._maxErrors;
};

/**
 * Returns base path.
 *
 * @returns {String}
 */
Configuration.prototype.getBasePath = function() {
    return this._basePath;
};

/**
 * Overrides specified settings.
 *
 * @param {String} overrides
 */
Configuration.prototype.override = function(overrides) {
    Object.keys(overrides).forEach(function(key) {
        this._overrides[key] = overrides[key];
    }, this);
};

/**
 * Processes configuration and returns config options.
 *
 * @param {Object} config
 * @returns {Object}
 */
Configuration.prototype._processConfig = function(config) {
    var ruleSettings = {};

    // Base path
    if (config.configPath) {
        assert(
            typeof config.configPath === 'string',
            '`configPath` option requires string value'
        );
        this._basePath = path.dirname(config.configPath);
    }

    // Load plugins
    if (config.plugins) {
        assert(Array.isArray(config.plugins), '`plugins` option requires array value');
        config.plugins.forEach(this._loadPlugin, this);
    }

    // Apply presets
    var presetName = config.preset;
    if (presetName) {
        this._presetName = presetName;
        assert(typeof presetName === 'string', '`preset` option requires string value');
        var presetData = this._presets[presetName];
        assert(Boolean(presetData), 'Preset "' + presetName + '" does not exist');
        var presetResult = this._processConfig(presetData);
        Object.keys(presetResult).forEach(function(key) {
            ruleSettings[key] = presetResult[key];
        });
    }

    // File extensions
    if (config.fileExtensions) {
        assert(
            typeof config.fileExtensions === 'string' || Array.isArray(config.fileExtensions),
            '`fileExtensions` option requires string or array value'
        );
        this._fileExtensions = [].concat(config.fileExtensions).map(function(ext) {
            return ext.toLowerCase();
        });
    }

    // File excludes
    if (config.excludeFiles) {
        assert(Array.isArray(config.excludeFiles), '`excludeFiles` option requires array value');
        this._excludedFileMasks = config.excludeFiles;
        this._excludedFileMatchers = this._excludedFileMasks.map(function(fileMask) {
            return new minimatch.Minimatch(path.resolve(this._basePath, fileMask), {
                dot: true
            });
        }, this);
    }

    // Additional rules
    if (config.additionalRules) {
        assert(Array.isArray(config.additionalRules), '`additionalRules` option requires array value');
        config.additionalRules.forEach(this._loadAdditionalRule, this);
    }

    if (config.hasOwnProperty('maxErrors')) {
        assert(
            typeof config.maxErrors === 'number' || config.maxErrors === null,
            '`maxErrors` option requires number or null value'
        );
        this._maxErrors = config.maxErrors;
    }

    // Apply config options
    Object.keys(config).forEach(function(key) {
        if (!BUILTIN_OPTIONS[key]) {
            ruleSettings[key] = config[key];
        }
    });

    return ruleSettings;
};

/**
 * Loads plugin data.
 *
 * @param {function(Configuration)} plugin
 * @protected
 */
Configuration.prototype._loadPlugin = function(plugin) {
    assert(typeof plugin === 'function', '`plugin` should be a function');
    plugin(this);
};

/**
 * Includes plugin in the configuration environment.
 *
 * @param {function(Configuration)|*} plugin
 */
Configuration.prototype.usePlugin = function(plugin) {
    this._loadPlugin(plugin);
};

/**
 * Loads additional rule.
 *
 * @param {Rule} additionalRule
 * @protected
 */
Configuration.prototype._loadAdditionalRule = function(additionalRule) {
    assert(typeof additionalRule === 'object', '`additionalRule` should be an object');
    this.registerRule(additionalRule);
};

/**
 * Throws error for non camel-case options.
 *
 * @param {Object} ruleSettings
 */
Configuration.prototype._throwNonCamelCaseErrorIfNeeded = function(ruleSettings) {
    function symbolToUpperCase(s, symbol) {
        return symbol.toUpperCase();
    }
    function fixSettings(originalSettings) {
        var result = {};
        Object.keys(originalSettings).forEach(function(key) {
            var camelCaseName = key.replace(/_([a-zA-Z])/g, symbolToUpperCase);
            var value = originalSettings[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                value = fixSettings(value);
            }
            result[camelCaseName] = value;
        });
        return result;
    }

    Object.keys(ruleSettings).forEach(function(key) {
        if (key.indexOf('_') !== -1) {
            throw new Error(
                'JSCS now accepts configuration options in camel case. Sorry for inconvenience. ' +
                'On the bright side, we tried to convert your jscs config to camel case.\n' +
                '----------------------------------------\n' +
                JSON.stringify(fixSettings(ruleSettings), null, 4) +
                '\n----------------------------------------\n'
            );
        }
    });
};

/**
 * Adds rule to the collection.
 *
 * @param {Rule} rule
 */
Configuration.prototype.registerRule = function(rule) {
    var optionName = rule.getOptionName();
    assert(!this._rules.hasOwnProperty(optionName), 'Rule "' + optionName + '" is already registered');
    this._rules[optionName] = rule;
};

/**
 * Returns list of registered rules.
 *
 * @returns {Rule[]}
 */
Configuration.prototype.getRegisteredRules = function() {
    var rules = this._rules;
    return Object.keys(rules).map(function(ruleOptionName) {
        return rules[ruleOptionName];
    });
};

/**
 * Adds preset to the collection.
 *
 * @param {String} presetName
 * @param {Object} presetConfig
 */
Configuration.prototype.registerPreset = function(presetName, presetConfig) {
    this._presets[presetName] = presetConfig;
};

/**
 * Returns registered presets object (key - preset name, value - preset content).
 *
 * @returns {Object}
 */
Configuration.prototype.getRegisteredPresets = function() {
    return this._presets;
};

/**
 * Returns `true` if preset with specified name exists.
 *
 * @param {String} presetName
 * @return {Boolean}
 */
Configuration.prototype.hasPreset = function(presetName) {
    return this._presets.hasOwnProperty(presetName);
};

/**
 * Registers built-in Code Style cheking rules.
 */
Configuration.prototype.registerDefaultRules = function() {

    /*
        Important!
        These rules are linked explicitly to keep browser-version supported.
    */

    this.registerRule(new (require('../rules/require-curly-braces'))());
    this.registerRule(new (require('../rules/require-multiple-var-decl'))());
    this.registerRule(new (require('../rules/disallow-multiple-var-decl'))());
    this.registerRule(new (require('../rules/disallow-empty-blocks'))());
    this.registerRule(new (require('../rules/require-space-after-keywords'))());
    this.registerRule(new (require('../rules/disallow-space-after-keywords'))());
    this.registerRule(new (require('../rules/require-parentheses-around-iife'))());

    /* deprecated rules */
    this.registerRule(new (require('../rules/require-left-sticked-operators'))());
    this.registerRule(new (require('../rules/disallow-left-sticked-operators'))());
    this.registerRule(new (require('../rules/require-right-sticked-operators'))());
    this.registerRule(new (require('../rules/disallow-right-sticked-operators'))());
    this.registerRule(new (require('../rules/validate-jsdoc'))());
    /* deprecated rules (end) */

    this.registerRule(new (require('../rules/require-operator-before-line-break'))());
    this.registerRule(new (require('../rules/disallow-implicit-type-conversion'))());
    this.registerRule(new (require('../rules/require-camelcase-or-uppercase-identifiers'))());
    this.registerRule(new (require('../rules/disallow-keywords'))());
    this.registerRule(new (require('../rules/disallow-multiple-line-breaks'))());
    this.registerRule(new (require('../rules/disallow-multiple-line-strings'))());
    this.registerRule(new (require('../rules/validate-line-breaks'))());
    this.registerRule(new (require('../rules/validate-quote-marks'))());
    this.registerRule(new (require('../rules/validate-indentation'))());
    this.registerRule(new (require('../rules/disallow-trailing-whitespace'))());
    this.registerRule(new (require('../rules/disallow-mixed-spaces-and-tabs'))());
    this.registerRule(new (require('../rules/require-keywords-on-new-line'))());
    this.registerRule(new (require('../rules/disallow-keywords-on-new-line'))());
    this.registerRule(new (require('../rules/require-line-feed-at-file-end'))());
    this.registerRule(new (require('../rules/maximum-line-length'))());
    this.registerRule(new (require('../rules/require-yoda-conditions'))());
    this.registerRule(new (require('../rules/disallow-yoda-conditions'))());
    this.registerRule(new (require('../rules/require-spaces-inside-object-brackets'))());
    this.registerRule(new (require('../rules/require-spaces-inside-array-brackets'))());
    this.registerRule(new (require('../rules/require-spaces-inside-parentheses'))());
    this.registerRule(new (require('../rules/disallow-spaces-inside-object-brackets'))());
    this.registerRule(new (require('../rules/disallow-spaces-inside-array-brackets'))());
    this.registerRule(new (require('../rules/disallow-spaces-inside-parentheses'))());
    this.registerRule(new (require('../rules/require-blocks-on-newline'))());
    this.registerRule(new (require('../rules/require-space-after-object-keys'))());
    this.registerRule(new (require('../rules/require-space-before-object-values'))());
    this.registerRule(new (require('../rules/disallow-space-after-object-keys'))());
    this.registerRule(new (require('../rules/disallow-space-before-object-values'))());
    this.registerRule(new (require('../rules/disallow-quoted-keys-in-objects'))());
    this.registerRule(new (require('../rules/disallow-dangling-underscores'))());
    this.registerRule(new (require('../rules/require-aligned-object-values'))());

    this.registerRule(new (require('../rules/disallow-padding-newlines-in-blocks'))());
    this.registerRule(new (require('../rules/require-padding-newlines-in-blocks'))());
    this.registerRule(new (require('../rules/require-padding-newlines-in-objects'))());
    this.registerRule(new (require('../rules/disallow-padding-newlines-in-objects'))());
    this.registerRule(new (require('../rules/require-newline-before-block-statements'))());
    this.registerRule(new (require('../rules/disallow-newline-before-block-statements'))());

    this.registerRule(new (require('../rules/disallow-trailing-comma'))());
    this.registerRule(new (require('../rules/require-trailing-comma'))());

    this.registerRule(new (require('../rules/disallow-comma-before-line-break'))());
    this.registerRule(new (require('../rules/require-comma-before-line-break'))());

    this.registerRule(new (require('../rules/disallow-space-before-block-statements.js'))());
    this.registerRule(new (require('../rules/require-space-before-block-statements.js'))());

    this.registerRule(new (require('../rules/disallow-space-before-postfix-unary-operators.js'))());
    this.registerRule(new (require('../rules/require-space-before-postfix-unary-operators.js'))());

    this.registerRule(new (require('../rules/disallow-space-after-prefix-unary-operators.js'))());
    this.registerRule(new (require('../rules/require-space-after-prefix-unary-operators.js'))());

    this.registerRule(new (require('../rules/disallow-space-before-binary-operators'))());
    this.registerRule(new (require('../rules/require-space-before-binary-operators'))());

    this.registerRule(new (require('../rules/disallow-space-after-binary-operators'))());
    this.registerRule(new (require('../rules/require-space-after-binary-operators'))());

    this.registerRule(new (require('../rules/require-spaces-in-conditional-expression'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-conditional-expression'))());

    this.registerRule(new (require('../rules/require-spaces-in-function'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-function'))());
    this.registerRule(new (require('../rules/require-spaces-in-function-expression'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-function-expression'))());
    this.registerRule(new (require('../rules/require-spaces-in-anonymous-function-expression'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-anonymous-function-expression'))());
    this.registerRule(new (require('../rules/require-spaces-in-named-function-expression'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-named-function-expression'))());
    this.registerRule(new (require('../rules/require-spaces-in-function-declaration'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-function-declaration'))());

    this.registerRule(new (require('../rules/require-spaces-in-call-expression'))());
    this.registerRule(new (require('../rules/disallow-spaces-in-call-expression'))());

    this.registerRule(new (require('../rules/validate-parameter-separator'))());

    this.registerRule(new (require('../rules/require-capitalized-constructors'))());

    this.registerRule(new (require('../rules/safe-context-keyword'))());

    this.registerRule(new (require('../rules/require-dot-notation'))());

    this.registerRule(new (require('../rules/require-space-after-line-comment'))());
    this.registerRule(new (require('../rules/disallow-space-after-line-comment'))());

    this.registerRule(new (require('../rules/require-anonymous-functions'))());
    this.registerRule(new (require('../rules/disallow-anonymous-functions'))());

    this.registerRule(new (require('../rules/require-function-declarations'))());
    this.registerRule(new (require('../rules/disallow-function-declarations'))());

    this.registerRule(new (require('../rules/require-capitalized-comments'))());
    this.registerRule(new (require('../rules/disallow-capitalized-comments'))());
};

/**
 * Registers built-in Code Style cheking presets.
 */
Configuration.prototype.registerDefaultPresets = function() {
    // https://github.com/airbnb/javascript
    this.registerPreset('airbnb', require('../../presets/airbnb.json'));

    // http://javascript.crockford.com/code.html
    this.registerPreset('crockford', require('../../presets/crockford.json'));

    // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    this.registerPreset('google', require('../../presets/google.json'));

    // https://contribute.jquery.org/style-guide/js/
    this.registerPreset('jquery', require('../../presets/jquery.json'));

    // https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2
    this.registerPreset('mdcs', require('../../presets/mdcs.json'));

    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    this.registerPreset('wikimedia', require('../../presets/wikimedia.json'));

    // https://github.com/ymaps/codestyle/blob/master/js.md
    this.registerPreset('yandex', require('../../presets/yandex.json'));
};

module.exports = Configuration;
