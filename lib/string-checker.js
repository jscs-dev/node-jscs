var Errors = require('./errors');
var JsFile = require('./js-file');
var TokenIndex = require('./token-index');
var Configuration = require('./config/configuration');

var MAX_FIX_ATTEMPTS = 5;

function getInternalErrorMessage(rule, e) {
    return 'Error running rule ' + rule + ': ' +
        'This is an issue with JSCS and not your codebase.\n' +
        'Please file an issue (with the stack trace below) at: ' +
        'https://github.com/jscs-dev/node-jscs/issues/new\n' + e.stack;
}

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 */
var StringChecker = function() {
    this._configuredRules = [];

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

        this._configuredRules = this._configuration.getConfiguredRules();
        this._maxErrors = this._configuration.getMaxErrors();
    },

    /**
     * Checks file provided with a string.
     *
     * @param {String} source
     * @param {String} [filename='input']
     * @returns {Errors}
     */
    checkString: function(source, filename) {
        filename = filename || 'input';

        var file = this._createJsFileInstance(filename, source);

        var errors = new Errors(file);

        file.getParseErrors().forEach(function(parseError) {
            if (!this._maxErrorsExceeded) {
                this._addParseError(errors, parseError, file);
            }
        }, this);

        if (!file._program || file._program.firstChild.type === 'EOF') {
            return errors;
        }

        this._checkJsFile(file, errors);

        return errors;
    },

    /**
     * Apply fix for common errors.
     *
     * @param {Error} error
     * @return {Boolean} whether the correction was carried out
     * @private
     */
    _fixCommonError: function(error) {
        if (error.fix) {
            // "error.fixed = true" should go first, so rule can
            // decide for itself (with "error.fixed = false")
            // if it can fix this particular error
            error.fixed = true;
            error.fix();
        }

        return !!error.fixed;
    },

    /**
     * Apply fix for specific error.
     *
     * @param {JsFile} file
     * @param {Error} error
     * @return {Boolean} whether the correction was carried out
     * @private
     */
    _fixSpecificError: function(file, error) {
        var configuration = this.getConfiguration();
        var instance = configuration.getConfiguredRule(error.rule);

        if (instance && instance._fix) {
            // "error.fixed = true" should go first, so rule can
            // decide for itself (with "error.fixed = false")
            // if it can fix this particular error
            error.fixed = true;
            instance._fix(file, error);
        }

        return !!error.fixed;
    },

    /**
     * Apply specific and common fixes.
     *
     * @param {JsFile} file
     * @param {Errors} errors
     * @protected
     */
    _fixJsFile: function(file, errors) {
        errors.getErrorList().forEach(function(error) {
            if (error.fixed) {
                return;
            }

            try {
                // Try to apply fixes for common errors
                var isFixed = this._fixCommonError(error);

                // Apply specific fix
                if (!isFixed) {
                    this._fixSpecificError(file, error);
                }
            } catch (e) {
                error.fixed = false;
                errors.add(
                    getInternalErrorMessage(error.rule, e),
                    file.getProgram()
                );
            }
        }, this);
    },

    /**
     * Checks a file specified using JsFile instance.
     * Fills Errors instance with validation errors.
     *
     * @param {JsFile} file
     * @param {Errors} errors
     * @protected
     */
    _checkJsFile: function(file, errors) {
        if (this._maxErrorsExceeded) {
            return;
        }

        var errorFilter = this._configuration.getErrorFilter();

        this._configuredRules.forEach(function(rule) {
            errors.setCurrentRule(rule.getOptionName());

            try {
                rule.check(file, errors);
            } catch (e) {
                errors.setCurrentRule('internalError');
                errors.add(getInternalErrorMessage(rule.getOptionName(), e), file.getProgram());
            }
        }, this);

        this._configuration.getUnsupportedRuleNames().forEach(function(rulename) {
            errors.add('Unsupported rule: ' + rulename, file.getProgram());
        });

        var program = file.getProgram();
        var tokenIndex = new TokenIndex(program.getFirstToken());
        errors.calculateErrorLocations(tokenIndex);
        errors.filter(function(error) {
            if (error.element) {
                return tokenIndex.isRuleEnabled(error.rule, error.element);
            } else {
                return true;
            }
        });

        // sort errors list to show errors as they appear in source
        errors.getErrorList().sort(function(a, b) {
            return (a.line - b.line) || (a.column - b.column);
        });

        if (errorFilter) {
            errors.filter(errorFilter);
        }

        if (this.maxErrorsEnabled()) {
            if (this._maxErrors === -1 || this._maxErrors === null) {
                this._maxErrorsExceeded = false;

            } else {
                this._maxErrorsExceeded = this._errorsFound + errors.getErrorCount() > this._maxErrors;
                errors.stripErrorList(Math.max(0, this._maxErrors - this._errorsFound));
            }
        }

        this._errorsFound += errors.getErrorCount();
    },

    /**
     * Adds parse error to the error list.
     *
     * @param {Errors} errors
     * @param {Error} parseError
     * @param {JsFile} file
     * @private
     */
    _addParseError: function(errors, parseError, file) {
        if (this._maxErrorsExceeded) {
            return;
        }

        errors.add(parseError, file.getProgram());

        if (this.maxErrorsEnabled()) {
            this._errorsFound += 1;
            this._maxErrorsExceeded = this._errorsFound >= this._maxErrors;
        }
    },

    /**
     * Creates configured JsFile instance.
     *
     * @param {String} filename
     * @param {String} source
     * @private
     */
    _createJsFileInstance: function(filename, source) {
        return new JsFile({
            filename: filename,
            source: source,
            es3: this._configuration.isES3Enabled()
        });
    },

    /**
     * Checks and fix file provided with a string.
     *
     * @param {String} source
     * @param {String} [filename='input']
     * @returns {{output: String, errors: Errors}}
     */
    fixString: function(source, filename) {
        filename = filename || 'input';

        var file = this._createJsFileInstance(filename, source);
        var errors = new Errors(file);

        var parseErrors = file.getParseErrors();
        if (parseErrors.length > 0) {
            parseErrors.forEach(function(parseError) {
                this._addParseError(errors, parseError, file);
            }, this);

            return {output: source, errors: errors};
        } else {
            var attempt = 0;
            do {

                // Fill in errors list
                this._checkJsFile(file, errors);

                // Apply fixes
                this._fixJsFile(file, errors);

                var hasFixes = errors.getErrorList().some(function(err) {
                    return err.fixed;
                });

                if (!hasFixes) {
                    break;
                }

                file = this._createJsFileInstance(filename, file.render());
                errors = new Errors(file);
                attempt++;
            } while (attempt < MAX_FIX_ATTEMPTS);

            return {output: file.getSource(), errors: errors};
        }
    },

    /**
     * Returns `true` if max erros limit is enabled.
     *
     * @returns {Boolean}
     */
    maxErrorsEnabled: function() {
        return this._maxErrors !== null && this._maxErrors !== -1;
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
