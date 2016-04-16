var assert = require('assert');
var path = require('path');
var fs = require('fs');

var minimatch = require('minimatch');
var defaults = {
    cwd: '.',
    maxErrors: 50
};

var _ = require('lodash');

var BUILTIN_OPTIONS = {
    plugins: true,
    preset: true,
    excludeFiles: true,
    additionalRules: true,
    fileExtensions: true,
    extract: true,
    maxErrors: true,
    configPath: true,
    es3: true,
    errorFilter: true,
    fix: true
};

/**
 * JSCS Configuration.
 * Browser/Rhino-compatible.
 *
 * @name Configuration
 */
function Configuration() {
    /**
     * List of the registered (not used) presets.
     *
     * @protected
     * @type {Object}
     */
    this._presets = {};

    /**
     * Name of the preset (if used).
     *
     * @protected
     * @type {String|null}
     */
    this._presetName = null;

    /**
     * List of loaded presets.
     *
     * @protected
     * @type {String|null}
     */
    this._loadedPresets = [];

    /**
     * List of rules instances.
     *
     * @protected
     * @type {Object}
     */
    this._rules = {};

    /**
     * List of configurated rule instances.
     *
     * @protected
     * @type {Object}
     */
    this._ruleSettings = {};

    /**
     * List of configured rules.
     *
     * @protected
     * @type {Array}
     */
    this._configuredRules = [];

    /**
     * List of unsupported rules.
     *
     * @protected
     * @type {Array}
     */
    this._unsupportedRuleNames = [];

    /**
     * File extensions that would be checked.
     *
     * @protected
     * @type {Array}
     */
    this._fileExtensions = [];

    /**
     * Default file extensions that would be checked.
     *
     * @protected
     * @type {Array}
     */
    this._defaultFileExtensions = ['.js'];

    /**
     * Exclusion masks.
     *
     * @protected
     * @type {Array}
     */
    this._excludedFileMasks = [];

    /**
     * Default exclusion masks, will be rewritten if user has their own masks.
     *
     * @protected
     * @type {Array}
     */
    this._defaultExcludedFileMasks = ['.git/**', 'node_modules/**'];

    /**
     * List of existing files that falls under exclusion masks.
     *
     * @protected
     * @type {Array}
     */
    this._excludedFileMatchers = [];

    /**
     * Extraction masks.
     *
     * @protected
     * @type {Array}
     */
    this._extractFileMasks = [];

    /**
     * Default extractions masks.
     *
     * @protected
     * @type {Array}
     */
    this._defaultExtractFileMasks = ['**/*.+(htm|html|xhtml)'];

    /**
     * List of file matchers from which to extract JavaScript.
     *
     * @protected
     * @type {Array}
     */
    this._extractFileMatchers = [];

    /**
     * Maxixum amount of error that would be reportered.
     *
     * @protected
     * @type {Number}
     */
    this._maxErrors = defaults.maxErrors;

    /**
     * JSCS CWD.
     *
     * @protected
     * @type {String}
     */
    this._basePath = defaults.cwd;

    /**
     * List of overrided options (usually from CLI).
     *
     * @protected
     * @type {Object}
     */
    this._overrides = {};

    /**
     * Is "ES3" mode enabled?.
     *
     * @protected
     * @type {Boolean}
     */
    this._es3Enabled = false;

    /**
     * A filter function that determines whether or not to report an error.
     *
     * @protected
     * @type {Function|null}
     */
    this._errorFilter = null;
}

/**
 * Load settings from a configuration.
 *
 * @param {Object} config
 */
Configuration.prototype.load = function(config) {

    // Apply all the options
    this._processConfig(config);

    // Load and apply all the rules
    this._useRules();
};

/**
 * Returns resulting configuration after preset is applied and options are processed.
 *
 * @return {Object}
 */
Configuration.prototype.getProcessedConfig = function() {
    var result = {};
    Object.keys(this._ruleSettings).forEach(function(key) {
        result[key] = this._ruleSettings[key];
    }, this);
    result.excludeFiles = this._excludedFileMasks;
    result.fileExtensions = this._fileExtensions;
    result.extract = this._extractFileMasks;
    result.maxErrors = this._maxErrors;
    result.preset = this._presetName;
    result.es3 = this._es3Enabled;
    result.errorFilter = this._errorFilter;
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
 * Returns configured rule.
 *
 * @returns {Rule | null}
 */
Configuration.prototype.getConfiguredRule = function(name) {
    return this._configuredRules.filter(function(rule) {
        return rule.getOptionName() === name;
    })[0] || null;
};

/**
 * Returns the list of unsupported rule names.
 *
 * @return {String[]}
 */
Configuration.prototype.getUnsupportedRuleNames = function() {
    return this._unsupportedRuleNames;
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
 * Returns extract file masks.
 *
 * @returns {String[]}
 */
Configuration.prototype.getExtractFileMasks = function() {
    return this._extractFileMasks;
};

/**
 * Should filePath to be extracted?
 *
 * @returns {Boolean}
 */
Configuration.prototype.shouldExtractFile = function(filePath) {
    filePath = path.resolve(filePath);
    return this._extractFileMatchers.some(function(matcher) {
        return matcher.match(filePath);
    });
};

/**
 * Returns maximal error count.
 *
 * @returns {Number|null}
 */
Configuration.prototype.getMaxErrors = function() {
    return this._maxErrors;
};

/**
 * Getter "fix" option value.
 *
 * @return {Boolean}
 */
Configuration.prototype.getFix = function() {
    return !!this._fix;
};

/**
 * Returns `true` if `es3` option is enabled.
 *
 * @returns {Boolean}
 */
Configuration.prototype.isES3Enabled = function() {
    return this._es3Enabled;
};

/**
 * Returns the loaded error filter.
 *
 * @returns {Function|null}
 */
Configuration.prototype.getErrorFilter = function() {
    return this._errorFilter;
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
 * returns options, but not rules, from the provided config
 *
 * @param  {Object} config
 * @returns {Object}
 */
Configuration.prototype._getOptionsFromConfig = function(config) {
    return Object.keys(config).reduce(function(options, key) {
        if (BUILTIN_OPTIONS[key]) {
            options[key] = config[key];
        }
        return options;
    }, {});
};

Configuration.prototype._errorOnRemovedOptions = function(config) {
    var errors = ['Config values to remove in 3.0:'];

    if (config.hasOwnProperty('esprima')) {
        errors.push('The `esprima` option since CST uses babylon (the babel parser) under the hood');
    }

    if (config.hasOwnProperty('esprimaOptions')) {
        errors.push('The `esprimaOptions` option.');
    }

    if (config.hasOwnProperty('esnext')) {
        errors.push('The `esnext` option is enabled by default.');
    }

    if (config.hasOwnProperty('verbose')) {
        errors.push('The `verbose` option is enabled by default.');
    }

    if (errors.length > 1) {
        throw new Error(errors.join('\n'));
    }
};

/**
 * Processes configuration and returns config options.
 *
 * @param {Object} config
 */
Configuration.prototype._processConfig = function(config) {
    var overrides = this._overrides;
    var currentConfig = {};

    // Copy configuration so original config would be intact
    copyConfiguration(config, currentConfig);

    // Override the properties
    copyConfiguration(overrides, currentConfig);

    this._errorOnRemovedOptions(currentConfig);

    // NOTE: options is a separate object to ensure that future options must be added
    // to BUILTIN_OPTIONS to work, which also assures they aren't mistaken for a rule
    var options = this._getOptionsFromConfig(currentConfig);

    // Base path
    if (this._basePath === defaults.cwd && options.configPath) {
        assert(
            typeof options.configPath === 'string',
            '`configPath` option requires string value'
        );
        this._basePath = path.dirname(options.configPath);
    }

    if (options.hasOwnProperty('plugins')) {
        assert(Array.isArray(options.plugins), '`plugins` option requires array value');
        options.plugins.forEach(function(plugin) {
            this._loadPlugin(plugin, options.configPath);
        }, this);
    }

    if (options.hasOwnProperty('additionalRules')) {
        assert(Array.isArray(options.additionalRules), '`additionalRules` option requires array value');
        options.additionalRules.forEach(function(rule) {
            this._loadAdditionalRule(rule, options.configPath);
        }, this);
    }

    if (options.hasOwnProperty('extract')) {
        this._loadExtract(options.extract);
    }

    if (options.hasOwnProperty('fileExtensions')) {
        this._loadFileExtensions(options.fileExtensions);

    // Set default extensions if there is no presets that could define their own
    } else if (!options.hasOwnProperty('preset')) {
        this._loadFileExtensions(this._defaultFileExtensions);
    }

    if (options.hasOwnProperty('excludeFiles')) {
        this._loadExcludedFiles(options.excludeFiles);

    // Set default masks if there is no presets that could define their own
    } else if (!options.hasOwnProperty('preset')) {
        this._loadExcludedFiles(this._defaultExcludedFileMasks);
    }

    if (options.hasOwnProperty('fix')) {
        this._loadFix(options.fix);
    }

    this._loadMaxError(options);

    if (options.hasOwnProperty('es3')) {
        this._loadES3(options.es3);
    }

    if (options.hasOwnProperty('errorFilter')) {
        this._loadErrorFilter(options.errorFilter, options.configPath);
    }

    // Apply presets
    if (options.hasOwnProperty('preset')) {
        this._loadPreset(options.preset, options.configPath);
    }

    this._loadRules(currentConfig);
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
 * Load rules.
 *
 * @param {Object} config
 * @protected
 */
Configuration.prototype._loadRules = function(config) {
    Object.keys(config).forEach(function(key) {

        // Only rules should be processed
        if (BUILTIN_OPTIONS[key]) {
            return;
        }

        if (this._rules[key]) {
            var optionValue = config[key];

            // Disable rule it it equals "false" or "null"
            if (optionValue === null || optionValue === false) {
                delete this._ruleSettings[key];

            } else {
                this._ruleSettings[key] = config[key];
            }

        } else if (this._unsupportedRuleNames.indexOf(key) === -1) {
            this._unsupportedRuleNames.push(key);
        }
    }, this);
};

/**
 * Loads an error filter.
 *
 * @param {Function|null} errorFilter
 * @protected
 */
Configuration.prototype._loadErrorFilter = function(errorFilter) {
    assert(
        typeof errorFilter === 'function' ||
        errorFilter === null,
        '`errorFilter` option requires a function or null value'
    );
    this._errorFilter = errorFilter;
};

/**
 * Load "es3" option.
 *
 * @param {Boolean} es3
 * @protected
 */
Configuration.prototype._loadES3 = function(es3) {
    assert(
        typeof es3 === 'boolean' || es3 === null,
        '`es3` option requires boolean or null value'
    );
    this._es3Enabled = Boolean(es3);
};

/**
 * Load "maxError" option.
 *
 * @param {Object} options
 * @protected
 */
Configuration.prototype._loadMaxError = function(options) {

    // If "fix" option is enabled, set to Inifinity, otherwise this option
    // doesn't make sense with "fix" conjunction
    if (this._fix === true) {
        this._maxErrors = Infinity;

        return;
    }

    if (!options.hasOwnProperty('maxErrors')) {
        return;
    }

    var maxErrors = options.maxErrors === null ? null : Number(options.maxErrors);

    assert(
        maxErrors === -1 || maxErrors > 0 || maxErrors === null,
        '`maxErrors` option requires -1, null value or positive number'
    );

    this._maxErrors = maxErrors;
};

/**
 * Load "fix" option.
 *
 * @param {Boolean|null} fix
 * @protected
 */
Configuration.prototype._loadFix = function(fix) {
    fix = fix === null ? false : fix;

    assert(
        typeof fix === 'boolean',
        '`fix` option requires boolean or null value'
    );

    this._fix = fix;
};

/**
 * Load preset.
 *
 * @param {Object} preset
 * @protected
 */
Configuration.prototype._loadPreset = function(preset) {
    if (this._loadedPresets.indexOf(preset) > -1) {
        return;
    }

    // Do not keep adding preset from CLI (#2087)
    delete this._overrides.preset;

    this._loadedPresets.push(preset);

    // If preset is loaded from another preset - preserve the original name
    if (!this._presetName) {
        this._presetName = preset;
    }
    assert(typeof preset === 'string', '`preset` option requires string value');

    var presetData = this._presets[preset];
    assert(Boolean(presetData), 'Preset "' + preset + '" does not exist');

    // Process config from the preset
    this._processConfig(this._presets[preset]);
};

/**
 * Load file extensions.
 *
 * @param {String|Array} extensions
 * @protected
 */
Configuration.prototype._loadFileExtensions = function(extensions) {
    assert(
        typeof extensions === 'string' || Array.isArray(extensions),
        '`fileExtensions` option requires string or array value'
    );
    this._fileExtensions = this._fileExtensions.concat(extensions).map(function(ext) {
        return ext.toLowerCase();
    });
};

/**
 * Load excluded paths.
 *
 * @param {Array} masks
 * @protected
 */
Configuration.prototype._loadExcludedFiles = function(masks) {
    assert(Array.isArray(masks), '`excludeFiles` option requires array value');

    this._excludedFileMasks = this._excludedFileMasks.concat(masks);
    this._excludedFileMatchers = this._excludedFileMasks.map(function(fileMask) {
        return new minimatch.Minimatch(path.resolve(this._basePath, fileMask), {
            dot: true
        });
    }, this);
};

/**
 * Load paths for extract.
 *
 * @param {Array} masks
 * @protected
 */
Configuration.prototype._loadExtract = function(masks) {
    if (masks === true) {
        masks = this._defaultExtractFileMasks;
    } else if (masks === false) {
        masks = [];
    }

    assert(Array.isArray(masks), '`extract` option should be array of strings');
    this._extractFileMasks = masks.slice();
    this._extractFileMatchers = this._extractFileMasks.map(function(fileMask) {
        return new minimatch.Minimatch(path.resolve(this._basePath, fileMask), {
            dot: true
        });
    }, this);
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
 * Includes plugin in the configuration environment.
 *
 * @param {function(Configuration)|*} plugin
 */
Configuration.prototype.usePlugin = function(plugin) {
    this._loadPlugin(plugin);
};

/**
 * Apply the rules.
 *
 * @protected
 */
Configuration.prototype._useRules = function() {
    this._configuredRules = [];

    Object.keys(this._ruleSettings).forEach(function(optionName) {
        var rule = this._rules[optionName];
        rule.configure(this._ruleSettings[optionName]);
        this._configuredRules.push(rule);
    }, this);
};

/**
 * Adds rule to the collection.
 *
 * @param {Rule|Function} rule Rule instance or rule class.
 */
Configuration.prototype.registerRule = function(rule) {
    if (typeof rule === 'function') {
        var RuleClass = rule;
        rule = new RuleClass();
    }

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
    assert(_.isPlainObject(presetConfig), 'Preset should be an object');

    for (var key in presetConfig) {
        assert(typeof presetConfig[key] !== 'function', 'Preset should be an JSON object');
    }

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
 * Returns name of the active preset.
 *
 * @return {String}
 */
Configuration.prototype.getPresetName = function() {
    return this._presetName;
};

/**
 * Registers built-in Code Style cheking rules.
 */
Configuration.prototype.registerDefaultRules = function() {
    var dir = path.join(__dirname, '../rules');

    fs.readdirSync(dir).forEach(function(rule) {
        this.registerRule(
            require(path.join(dir, rule))
        );
    }, this);
};

/**
 * Registers built-in Code Style cheking presets.
 */
Configuration.prototype.registerDefaultPresets = function() {
    var dir = path.join(__dirname, '../../presets/');

    fs.readdirSync(dir).forEach(function(preset) {
        var name = preset.split('.')[0];
        var p = path.join(dir, preset);

        this.registerPreset(name, require(p));
    }, this);

    this.registerPreset('wikimedia', require('jscs-preset-wikimedia'));
};

module.exports = Configuration;

function copyConfiguration(source, dest) {
    Object.keys(source).forEach(function(key) {
        dest[key] = source[key];
    });
    if (source.configPath) {
        dest.configPath = source.configPath;
    }
}
