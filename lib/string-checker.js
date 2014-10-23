var esprima = require('esprima');
var Errors = require('./errors');
var JsFile = require('./js-file');
var Configuration = require('./config/configuration');

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 * @param {Boolean} verbose
 */
var StringChecker = function(verbose) {
    this._rules = [];
    this._configuredRules = [];
    this._config = {};
    this._verbose = verbose || false;
    this._errorsFound = 0;
    this._maxErrorsExceeded = false;

    this._configuration = this._createConfiguration();
    this._configuration.registerDefaultPresets();
};

StringChecker.prototype = {
    /**
     * Registers single Code Style checking rule.
     *
     * @param {Rule} rule
     */
    registerRule: function(rule) {
        this._configuration.registerRule(rule);
    },

    /**
     * Registers built-in Code Style cheking rules.
     */
    registerDefaultRules: function() {
        this._configuration.registerDefaultRules();
    },

    /**
     * Get processed config
     * @return {Object}
     */
    getProcessedConfig: function() {
        return this._configuration.getProcessedConfig();
    },

    /**
     * Loads configuration from JS Object. Activates and configures required rules.
     *
     * @param {Object} config
     */
    configure: function(config) {
        this._configuration.load(config);

        this._configuredRules = this._configuration.getConfiguredRules();
        this._maxErrors = this._configuration.getMaxErrors();
    },

    /**
     * Checks file provided with a string.
     * @param {String} str
     * @param {String} filename
     * @returns {Errors}
     */
    checkString: function(str, filename) {
        filename = filename || 'input';
        str = str.replace(/^#!?[^\n]+\n/gm, '');

        var tree;
        var parseError;

        try {
            tree = esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
        } catch (e) {
            parseError = e;
        }
        var file = new JsFile(filename, str, tree);
        var errors = new Errors(file, this._verbose);

        if (!this._maxErrorsExceeded) {
            if (parseError) {
                errors.setCurrentRule('parseError');
                errors.add(parseError.description, parseError.lineNumber, parseError.column);

                return errors;
            }

            this._configuredRules.forEach(function(rule) {
                // Do not process the rule if it's equals to null (#203)
                if (this._config[rule.getOptionName()] !== null) {
                    errors.setCurrentRule(rule.getOptionName());
                    rule.check(file, errors);
                }
            }, this);

            // sort errors list to show errors as they appear in source
            errors.getErrorList().sort(function(a, b) {
                return (a.line - b.line) || (a.column - b.column);
            });

            if (this._maxErrors !== null) {
                if (!this._maxErrorsExceeded) {
                    this._maxErrorsExceeded = this._errorsFound + errors.getErrorCount() > this._maxErrors;
                }
                errors.stripErrorList(Math.max(0, this._maxErrors - this._errorsFound));
            }

            this._errorsFound += errors.getErrorCount();
        }

        return errors;
    },

    /**
     * Returns `true` if error count exceeded `maxErrors` option value.
     *
     * @returns {Boolean}
     */
    maxErrorsExceeded: function() {
        return this._maxErrorsExceeded;
    },

    /**
     * Returns new configuration instance.
     *
     * @protected
     * @returns {Configuration}
     */
    _createConfiguration: function() {
        return new Configuration();
    },

    /**
     * Returns current configuration instance.
     *
     * @returns {Configuration}
     */
    getConfiguration: function() {
        return this._configuration;
    }
};

module.exports = StringChecker;
