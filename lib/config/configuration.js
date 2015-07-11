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
    configPath: true,
    esnext: true,
    es3: true,
    esprima: true,
    esprimaOptions: true,
    errorFilter: true,
    verbose: true
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
    this._fileExtensions = ['.js'];

    /**
     * Exclusion masks.
     *
     * @protected
     * @type {Array}
     */
    this._excludedFileMasks = ['node_modules/**'];

    /**
     * List of existing files that falls under exclusion masks.
     *
     * @protected
     * @type {Array}
     */
    this._excludedFileMatchers = [];

    /**
     * Maxixum amount of error that would be reportered.
     *
     * @protected
     * @type {Number}
     */
    this._maxErrors = 50;

    /**
     * JSCS CWD.
     *
     * @protected
     * @type {String}
     */
    this._basePath = '.';

    /**
     * List of overrided options (usually from CLI).
     *
     * @protected
     * @type {Object}
     */
    this._overrides = {};

    /**
     * Is "esnext" mode enabled?
     *
     * @protected
     * @type {Boolean}
     */
    this._esnextEnabled = false;

    /**
     * Is "ES3" mode enabled?.
     *
     * @protected
     * @type {Boolean}
     */
    this._es3Enabled = true;

    /**
     * Custom version of esprima if specified.
     *
     * @protected
     * @type {Object|null}
     */
    this._esprima = null;

    /**
     * Options that would be passed to esprima.
     *
     * @protected
     * @type {Object}
     */
    this._esprimaOptions = {};

    /**
     * A filter function that determines whether or not to report an error.
     *
     * @protected
     * @type {Function|null}
     */
    this._errorFilter = null;
    this._verbose = null;
}

/**
 * Load settings from a configuration.
 *
 * @param {Object} config
 */
Configuration.prototype.load = function(config) {

    // This is when we were young, need to remove at 2.0
    this._throwNonCamelCaseErrorIfNeeded(config);

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
    result.maxErrors = this._maxErrors;
    result.preset = this._presetName;
    result.esnext = this._esnextEnabled;
    result.es3 = this._es3Enabled;
    result.esprima = this._esprima;
    result.esprimaOptions = this._esprimaOptions;
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
 * Returns maximal error count.
 *
 * @returns {Number|undefined}
 */
Configuration.prototype.getMaxErrors = function() {
    return this._maxErrors;
};

/**
 * Returns `true` if `esnext` option is enabled.
 *
 * @returns {Boolean}
 */
Configuration.prototype.isESNextEnabled = function() {
    return this._esnextEnabled;
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
 * Returns `true` if `esprima` option is not null.
 *
 * @returns {Boolean}
 */
Configuration.prototype.hasCustomEsprima = function() {
    return !!this._esprima;
};

/**
 * Returns the custom esprima parser.
 *
 * @returns {Object|null}
 */
Configuration.prototype.getCustomEsprima = function() {
    return this._esprima;
};

/**
 * Returns verbose option.
 *
 * @returns {Object|null}
 */
Configuration.prototype.getVerbose = function() {
    return this._verbose || false;
};

/**
 * Returns custom Esprima options.
 *
 * @returns {Object}
 */
Configuration.prototype.getEsprimaOptions = function() {
    return this._esprimaOptions;
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

    // NOTE: options is a separate object to ensure that future options must be added
    // to BUILTIN_OPTIONS to work, which also assures they aren't mistaken for a rule
    var options = this._getOptionsFromConfig(currentConfig);

    // Base path
    if (options.configPath) {
        assert(
            typeof options.configPath === 'string',
            '`configPath` option requires string value'
        );
        this._basePath = path.dirname(options.configPath);
    }

    if (options.hasOwnProperty('plugins')) {
        assert(Array.isArray(options.plugins), '`plugins` option requires array value');
        options.plugins.forEach(this._loadPlugin, this);
    }

    if (options.hasOwnProperty('additionalRules')) {
        assert(Array.isArray(options.additionalRules), '`additionalRules` option requires array value');
        options.additionalRules.forEach(this._loadAdditionalRule, this);
    }

    if (options.hasOwnProperty('fileExtensions')) {
        this._loadFileExtensions(options.fileExtensions);
    }

    if (options.hasOwnProperty('excludeFiles')) {
        this._loadExcludedFiles(options.excludeFiles);
    }

    if (options.hasOwnProperty('maxErrors')) {
        this._loadMaxError(options.maxErrors);
    }

    if (options.hasOwnProperty('esnext')) {
        this._loadESNext(options.esnext);
    }

    if (options.hasOwnProperty('es3')) {
        this._loadES3(options.es3);
    }

    if (options.hasOwnProperty('esprima')) {
        this._loadEsprima(options.esprima);
    }

    if (options.hasOwnProperty('esprimaOptions')) {
        this._loadEsprimaOptions(options.esprimaOptions);
    }

    if (options.hasOwnProperty('errorFilter')) {
        this._loadErrorFilter(options.errorFilter);
    }

    if (options.hasOwnProperty('verbose')) {
        this._loadVerbose(options.verbose);
    }

    // Apply presets
    if (options.hasOwnProperty('preset')) {
        this._loadPreset(options.preset);
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

            if (optionValue !== null) {
                this._ruleSettings[key] = config[key];

            } else {
                delete this._ruleSettings[key];
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
 * Loads verbose option.
 *
 * @param {Boolean|null} verbose
 * @protected
 */
Configuration.prototype._loadVerbose = function(verbose) {
    assert(
        typeof verbose === 'boolean' || verbose === null,
        '`verbose` option requires a boolean or null value'
    );
    this._verbose = verbose;
};

/*
 * Load "esnext" option.
 *
 * @param {Boolean} esnext
 * @protected
 */
Configuration.prototype._loadESNext = function(esnext) {
    assert(
        typeof esnext === 'boolean' || esnext === null,
        '`esnext` option requires boolean or null value'
    );
    this._esnextEnabled = Boolean(esnext);
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
 * @param {Number|null} maxErrors
 * @protected
 */
Configuration.prototype._loadMaxError = function(maxErrors) {
    maxErrors = maxErrors === null ? null : Number(maxErrors);

    assert(
        maxErrors > 0 || maxErrors === null,
        '`maxErrors` option requires positive number or null value'
    );
    this._maxErrors = maxErrors;
};

/**
 * Loads a custom esprima.
 *
 * @param {Object|null} esprima
 * @protected
 */
Configuration.prototype._loadEsprima = function(esprima) {
    assert(
        (esprima && typeof esprima.parse === 'function') ||
        esprima === null,
        '`esprima` option requires a null value or an object with a parse function'
    );
    this._esprima = esprima;
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
    this._fileExtensions = [].concat(extensions).map(function(ext) {
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

    this._excludedFileMasks = masks;
    this._excludedFileMatchers = this._excludedFileMasks.map(function(fileMask) {
        return new minimatch.Minimatch(path.resolve(this._basePath, fileMask), {
            dot: true
        });
    }, this);
};

/**
 * Loads custom Esprima options.
 *
 * @param {Object} esprimaOptions
 * @protected
 */
Configuration.prototype._loadEsprimaOptions = function(esprimaOptions) {
    assert(typeof esprimaOptions === 'object' && esprimaOptions !== null, '`esprimaOptions` should be an object');
    this._esprimaOptions = esprimaOptions;
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
 * Throws error for non camel-case options.
 * Not thorough method, but it should be removed anyway.
 *
 * @param {Object} config
 * @protected
 */
Configuration.prototype._throwNonCamelCaseErrorIfNeeded = function(config) {
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

    Object.keys(config).forEach(function(key) {
        if (key.indexOf('_') !== -1) {
            throw new Error(
                'JSCS now accepts configuration options in camel case. Sorry for inconvenience. ' +
                'On the bright side, we tried to convert your jscs config to camel case.\n' +
                '----------------------------------------\n' +
                JSON.stringify(fixSettings(config), null, 4) +
                '\n----------------------------------------\n'
            );
        }
    });
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

    /*
        Important!
        These rules are linked explicitly to keep browser-version supported.
    */

    /* ES6 only */
    this.registerRule(require('../rules/require-parentheses-around-arrow-param'));
    this.registerRule(require('../rules/disallow-parentheses-around-arrow-param'));
    this.registerRule(require('../rules/require-numeric-literals'));
    this.registerRule(require('../rules/require-arrow-functions'));
    this.registerRule(require('../rules/require-spread'));
    this.registerRule(require('../rules/require-template-strings'));
    this.registerRule(require('../rules/require-shorthand-arrow-functions'));
    /* ES6 only (end) */

    this.registerRule(require('../rules/require-curly-braces'));
    this.registerRule(require('../rules/disallow-curly-braces'));
    this.registerRule(require('../rules/require-multiple-var-decl'));
    this.registerRule(require('../rules/disallow-multiple-var-decl'));
    this.registerRule(require('../rules/disallow-empty-blocks'));
    this.registerRule(require('../rules/require-space-after-keywords'));
    this.registerRule(require('../rules/require-space-before-keywords'));
    this.registerRule(require('../rules/disallow-space-after-keywords'));
    this.registerRule(require('../rules/disallow-space-before-keywords'));
    this.registerRule(require('../rules/require-parentheses-around-iife'));

    /* deprecated rules */
    /* deprecated rules (end) */

    this.registerRule(require('../rules/require-operator-before-line-break'));
    this.registerRule(require('../rules/disallow-operator-before-line-break'));
    this.registerRule(require('../rules/disallow-implicit-type-conversion'));
    this.registerRule(require('../rules/require-camelcase-or-uppercase-identifiers'));
    this.registerRule(require('../rules/disallow-keywords'));
    this.registerRule(require('../rules/disallow-multiple-line-breaks'));
    this.registerRule(require('../rules/disallow-multiple-line-strings'));
    this.registerRule(require('../rules/disallow-multiple-spaces'));
    this.registerRule(require('../rules/validate-line-breaks'));
    this.registerRule(require('../rules/validate-quote-marks'));
    this.registerRule(require('../rules/validate-indentation'));
    this.registerRule(require('../rules/disallow-trailing-whitespace'));
    this.registerRule(require('../rules/disallow-mixed-spaces-and-tabs'));
    this.registerRule(require('../rules/require-object-keys-on-new-line'));
    this.registerRule(require('../rules/disallow-object-keys-on-new-line'));
    this.registerRule(require('../rules/require-keywords-on-new-line'));
    this.registerRule(require('../rules/disallow-keywords-on-new-line'));
    this.registerRule(require('../rules/require-line-feed-at-file-end'));
    this.registerRule(require('../rules/maximum-line-length'));
    this.registerRule(require('../rules/require-yoda-conditions'));
    this.registerRule(require('../rules/disallow-yoda-conditions'));
    this.registerRule(require('../rules/require-spaces-inside-brackets'));
    this.registerRule(require('../rules/require-spaces-inside-object-brackets'));
    this.registerRule(require('../rules/require-spaces-inside-array-brackets'));
    this.registerRule(require('../rules/require-spaces-inside-parentheses'));
    this.registerRule(require('../rules/disallow-spaces-inside-brackets'));
    this.registerRule(require('../rules/disallow-spaces-inside-object-brackets'));
    this.registerRule(require('../rules/disallow-spaces-inside-array-brackets'));
    this.registerRule(require('../rules/disallow-spaces-inside-parentheses'));
    this.registerRule(require('../rules/require-blocks-on-newline'));
    this.registerRule(require('../rules/require-space-after-object-keys'));
    this.registerRule(require('../rules/require-space-before-object-values'));
    this.registerRule(require('../rules/disallow-space-after-object-keys'));
    this.registerRule(require('../rules/disallow-space-before-object-values'));
    this.registerRule(require('../rules/disallow-quoted-keys-in-objects'));
    this.registerRule(require('../rules/require-quoted-keys-in-objects'));
    this.registerRule(require('../rules/disallow-dangling-underscores'));
    this.registerRule(require('../rules/require-aligned-object-values'));
    this.registerRule(require('../rules/validate-aligned-function-parameters'));

    this.registerRule(require('../rules/disallow-padding-newlines-after-blocks'));
    this.registerRule(require('../rules/require-padding-newlines-after-blocks'));

    this.registerRule(require('../rules/disallow-padding-newlines-in-blocks'));
    this.registerRule(require('../rules/require-padding-newlines-in-blocks'));
    this.registerRule(require('../rules/require-padding-newlines-in-objects'));
    this.registerRule(require('../rules/disallow-padding-newlines-in-objects'));
    this.registerRule(require('../rules/require-newline-before-block-statements'));
    this.registerRule(require('../rules/disallow-newline-before-block-statements'));

    this.registerRule(require('../rules/require-padding-newlines-before-keywords'));
    this.registerRule(require('../rules/disallow-padding-newlines-before-keywords'));

    this.registerRule(require('../rules/disallow-padding-newlines-before-line-comments'));
    this.registerRule(require('../rules/require-padding-newlines-before-line-comments'));

    this.registerRule(require('../rules/disallow-trailing-comma'));
    this.registerRule(require('../rules/require-trailing-comma'));

    this.registerRule(require('../rules/require-dollar-before-jquery-assignment'));

    this.registerRule(require('../rules/disallow-comma-before-line-break'));
    this.registerRule(require('../rules/require-comma-before-line-break'));

    this.registerRule(require('../rules/disallow-space-before-block-statements.js'));
    this.registerRule(require('../rules/require-space-before-block-statements.js'));

    this.registerRule(require('../rules/disallow-space-before-postfix-unary-operators.js'));
    this.registerRule(require('../rules/require-space-before-postfix-unary-operators.js'));

    this.registerRule(require('../rules/disallow-space-after-prefix-unary-operators.js'));
    this.registerRule(require('../rules/require-space-after-prefix-unary-operators.js'));

    this.registerRule(require('../rules/disallow-space-before-binary-operators'));
    this.registerRule(require('../rules/require-space-before-binary-operators'));

    this.registerRule(require('../rules/disallow-space-after-binary-operators'));
    this.registerRule(require('../rules/require-space-after-binary-operators'));

    this.registerRule(require('../rules/require-spaces-in-conditional-expression'));
    this.registerRule(require('../rules/disallow-spaces-in-conditional-expression'));

    this.registerRule(require('../rules/require-spaces-in-function'));
    this.registerRule(require('../rules/disallow-spaces-in-function'));
    this.registerRule(require('../rules/require-spaces-in-function-expression'));
    this.registerRule(require('../rules/disallow-spaces-in-function-expression'));
    this.registerRule(require('../rules/require-spaces-in-anonymous-function-expression'));
    this.registerRule(require('../rules/disallow-spaces-in-anonymous-function-expression'));
    this.registerRule(require('../rules/require-spaces-in-named-function-expression'));
    this.registerRule(require('../rules/disallow-spaces-in-named-function-expression'));
    this.registerRule(require('../rules/require-spaces-in-function-declaration'));
    this.registerRule(require('../rules/disallow-spaces-in-function-declaration'));

    this.registerRule(require('../rules/require-spaces-in-call-expression'));
    this.registerRule(require('../rules/disallow-spaces-in-call-expression'));

    this.registerRule(require('../rules/validate-parameter-separator'));
    this.registerRule(require('../rules/require-space-between-arguments'));
    this.registerRule(require('../rules/disallow-space-between-arguments'));

    this.registerRule(require('../rules/require-capitalized-constructors'));

    this.registerRule(require('../rules/safe-context-keyword'));

    this.registerRule(require('../rules/require-dot-notation'));

    this.registerRule(require('../rules/require-space-after-line-comment'));
    this.registerRule(require('../rules/disallow-space-after-line-comment'));

    this.registerRule(require('../rules/require-anonymous-functions'));
    this.registerRule(require('../rules/disallow-anonymous-functions'));
    this.registerRule(require('../rules/require-named-unassigned-functions'));
    this.registerRule(require('../rules/disallow-named-unassigned-functions'));

    this.registerRule(require('../rules/require-function-declarations'));
    this.registerRule(require('../rules/disallow-function-declarations'));

    this.registerRule(require('../rules/require-capitalized-comments'));
    this.registerRule(require('../rules/disallow-capitalized-comments'));

    this.registerRule(require('../rules/require-line-break-after-variable-assignment'));
    this.registerRule(require('../rules/require-padding-newline-after-variable-declaration'));

    this.registerRule(require('../rules/disallow-padding-newlines-after-use-strict'));
    this.registerRule(require('../rules/require-padding-newlines-after-use-strict'));

    this.registerRule(require('../rules/disallow-padding-newlines-before-export'));
    this.registerRule(require('../rules/require-padding-newlines-before-export'));

    this.registerRule(require('../rules/require-semicolons'));
    this.registerRule(require('../rules/disallow-semicolons'));

    this.registerRule(require('../rules/require-spaces-in-for-statement'));
    this.registerRule(require('../rules/disallow-spaces-in-for-statement'));

    this.registerRule(require('../rules/disallow-node-types'));

    this.registerRule(require('../rules/disallow-keywords-in-comments'));

    this.registerRule(require('../rules/disallow-identifier-names'));

    this.registerRule(require('../rules/maximum-number-of-lines'));

    this.registerRule(require('../rules/validate-newline-after-array-elements'));

    this.registerRule(require('../rules/disallow-not-operators-in-conditionals'));

    this.registerRule(require('../rules/require-matching-function-name'));

    this.registerRule(require('../rules/disallow-space-before-semicolon'));
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

    // http://gruntjs.com/contributing#syntax
    this.registerPreset('grunt', require('../../presets/grunt.json'));

    // https://contribute.jquery.org/style-guide/js/
    this.registerPreset('jquery', require('../../presets/jquery.json'));

    // https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2
    this.registerPreset('mdcs', require('../../presets/mdcs.json'));

    // https://github.com/felixge/node-style-guide#nodejs-style-guide
    this.registerPreset('node-style-guide', require('../../presets/node-style-guide.json'));

    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    this.registerPreset('wikimedia', require('../../presets/wikimedia.json'));

    // https://make.wordpress.org/core/handbook/coding-standards/javascript/
    this.registerPreset('wordpress', require('../../presets/wordpress.json'));

    // https://github.com/yandex/codestyle/blob/master/javascript.md
    this.registerPreset('yandex', require('../../presets/yandex.json'));
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
