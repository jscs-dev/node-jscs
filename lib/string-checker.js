var defaultEsprima = require('esprima');
var harmonyEsprima = require('esprima-harmony-jscs');
var Errors = require('./errors');
var JsFile = require('./js-file');
var Configuration = require('./config/configuration');

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 * @param {Boolean|Object} options either a boolean flag representing verbosity (deprecated), or an options object
 * @param {Boolean} options.verbose true adds the rule name to the error messages it produces, false does not
 * @param {Boolean} options.esnext true attempts to parse the code as es6, false does not
 * @param {Object} options.esprima if provided, will be used to parse source code instead of the built-in esprima parser
 */
var StringChecker = function(options) {
    this._configuredRules = [];

    this._errorsFound = 0;
    this._maxErrorsExceeded = false;

    this._configuration = this._createConfiguration();
    this._configuration.registerDefaultPresets();

    if (typeof options === 'boolean') {
        this._verbose = options;
    } else {
        options = options || {};
        this._verbose = options.verbose || false;
        this._esprima = options.esprima || (options.esnext ? harmonyEsprima : defaultEsprima);
    }
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
     * Registers built-in Code Style checking rules.
     */
    registerDefaultRules: function() {
        this._configuration.registerDefaultRules();
    },

    /**
     * Get processed config.
     *
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

        if (this._configuration.hasCustomEsprima()) {
            this._esprima = this._configuration.getCustomEsprima();
        } else if (this._configuration.isESNextEnabled()) {
            this._esprima = harmonyEsprima;
        }

        this._configuredRules = this._configuration.getConfiguredRules();
        this._maxErrors = this._configuration.getMaxErrors();
    },

    /**
     * Parses source code into an AST
     *
     * @param  {String} str the source code to parse
     * @return {Object}     the output AST
     * @throws Error on invalid source code.
     */
    _parse: function(str) {
        var hashbang = str.indexOf('#!') === 0;
        var tree;

        // Convert bin annotation to a comment
        if (hashbang) {
            str = '//' + str.substr(2);
        }

        // Strip special case code like iOS instrumentation imports: `#import 'abc.js';`
        str = str.replace(/^#!?[^\n]+\n/gm, '');

        var esprimaOptions = {
            tolerant: true
        };
        var esprimaOptionsFromConfig = this._configuration.getEsprimaOptions();
        for (var key in esprimaOptionsFromConfig) {
            esprimaOptions[key] = esprimaOptionsFromConfig[key];
        }
        // Set required options
        esprimaOptions.loc = true;
        esprimaOptions.range = true;
        esprimaOptions.comment = true;
        esprimaOptions.tokens = true;
        esprimaOptions.sourceType = 'module';

        tree = this._esprima.parse(str, esprimaOptions);

        // Remove the bin annotation comment
        if (hashbang) {
            tree.comments = tree.comments.slice(1);
        }

        return tree;
    },

    /**
     * Checks file provided with a string.
     * @param {String} str
     * @param {String} filename
     * @returns {Errors}
     */
    checkString: function(str, filename) {
        filename = filename || 'input';

        var tree;
        var parseError;

        try {
            tree = this._parse(str);
        } catch (e) {
            parseError = e;
        }

        var file = new JsFile(filename, str, tree, {
            es3: this._configuration.isES3Enabled(),
            es6: this._configuration.isESNextEnabled()
        });

        var errors = new Errors(file, this._verbose);
        var errorFilter = this._configuration.getErrorFilter();

        if (!this._maxErrorsExceeded) {
            if (parseError) {
                errors.setCurrentRule('parseError');
                errors.add(parseError.description, parseError.lineNumber, parseError.column);

                return errors;
            }

            this._configuredRules.forEach(function(rule) {
                errors.setCurrentRule(rule.getOptionName());
                rule.check(file, errors);
            }, this);

            this._configuration.getUnsupportedRuleNames().forEach(function(rulename) {
                errors.add('Unsupported rule: ' + rulename, 1, 0);
            });

            // sort errors list to show errors as they appear in source
            errors.getErrorList().sort(function(a, b) {
                return (a.line - b.line) || (a.column - b.column);
            });

            if (errorFilter) {
                errors.filter(errorFilter);
            }

            if (this._maxErrors !== null && !isNaN(this._maxErrors)) {
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
