var defaultEsprima = require('esprima');
var harmonyEsprima = require('esprima-harmony-jscs');
var Errors = require('./errors');
var JsFile = require('./js-file');
var preset = require('./options/preset');
var maxErrors = require('./options/max-errors');

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
    this._rules = [];
    this._activeRules = [];
    this._config = {};
    this._errorsFound = 0;
    this._maxErrorsExceeded = false;

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
        this._rules.push(rule);
    },

    /**
     * Registers built-in Code Style cheking rules.
     */
    registerDefaultRules: function() {
        this.registerRule(new (require('./rules/require-curly-braces'))());
        this.registerRule(new (require('./rules/require-multiple-var-decl'))());
        this.registerRule(new (require('./rules/disallow-multiple-var-decl'))());
        this.registerRule(new (require('./rules/disallow-empty-blocks'))());
        this.registerRule(new (require('./rules/require-space-after-keywords'))());
        this.registerRule(new (require('./rules/disallow-space-after-keywords'))());
        this.registerRule(new (require('./rules/require-parentheses-around-iife'))());

        /* deprecated rules */
        this.registerRule(new (require('./rules/require-left-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-left-sticked-operators'))());
        this.registerRule(new (require('./rules/require-right-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-right-sticked-operators'))());
        this.registerRule(new (require('./rules/validate-jsdoc'))());
        /* deprecated rules (end) */

        this.registerRule(new (require('./rules/require-operator-before-line-break'))());
        this.registerRule(new (require('./rules/disallow-implicit-type-conversion'))());
        this.registerRule(new (require('./rules/require-camelcase-or-uppercase-identifiers'))());
        this.registerRule(new (require('./rules/disallow-keywords'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-breaks'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-strings'))());
        this.registerRule(new (require('./rules/validate-line-breaks'))());
        this.registerRule(new (require('./rules/validate-quote-marks'))());
        this.registerRule(new (require('./rules/validate-indentation'))());
        this.registerRule(new (require('./rules/disallow-trailing-whitespace'))());
        this.registerRule(new (require('./rules/disallow-mixed-spaces-and-tabs'))());
        this.registerRule(new (require('./rules/require-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/disallow-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/require-line-feed-at-file-end'))());
        this.registerRule(new (require('./rules/maximum-line-length'))());
        this.registerRule(new (require('./rules/require-yoda-conditions'))());
        this.registerRule(new (require('./rules/disallow-yoda-conditions'))());
        this.registerRule(new (require('./rules/require-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/require-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/require-spaces-inside-parentheses'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-parentheses'))());
        this.registerRule(new (require('./rules/require-blocks-on-newline'))());
        this.registerRule(new (require('./rules/require-space-after-object-keys'))());
        this.registerRule(new (require('./rules/require-space-before-object-values'))());
        this.registerRule(new (require('./rules/disallow-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-space-before-object-values'))());
        this.registerRule(new (require('./rules/disallow-quoted-keys-in-objects'))());
        this.registerRule(new (require('./rules/disallow-dangling-underscores'))());
        this.registerRule(new (require('./rules/require-aligned-object-values'))());

        this.registerRule(new (require('./rules/disallow-padding-newlines-in-blocks'))());
        this.registerRule(new (require('./rules/require-padding-newlines-in-blocks'))());
        this.registerRule(new (require('./rules/require-padding-newlines-in-objects'))());
        this.registerRule(new (require('./rules/disallow-padding-newlines-in-objects'))());
        this.registerRule(new (require('./rules/require-newline-before-block-statements'))());
        this.registerRule(new (require('./rules/disallow-newline-before-block-statements'))());

        this.registerRule(new (require('./rules/disallow-trailing-comma'))());
        this.registerRule(new (require('./rules/require-trailing-comma'))());

        this.registerRule(new (require('./rules/disallow-comma-before-line-break'))());
        this.registerRule(new (require('./rules/require-comma-before-line-break'))());

        this.registerRule(new (require('./rules/disallow-space-before-block-statements.js'))());
        this.registerRule(new (require('./rules/require-space-before-block-statements.js'))());

        this.registerRule(new (require('./rules/disallow-space-before-postfix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-before-postfix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-after-prefix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-after-prefix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-before-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-before-binary-operators'))());

        this.registerRule(new (require('./rules/disallow-space-after-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-after-binary-operators'))());

        this.registerRule(new (require('./rules/require-spaces-in-conditional-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-conditional-expression'))());

        this.registerRule(new (require('./rules/require-spaces-in-function'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-function'))());
        this.registerRule(new (require('./rules/require-spaces-in-function-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-function-expression'))());
        this.registerRule(new (require('./rules/require-spaces-in-anonymous-function-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-anonymous-function-expression'))());
        this.registerRule(new (require('./rules/require-spaces-in-named-function-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-named-function-expression'))());
        this.registerRule(new (require('./rules/require-spaces-in-function-declaration'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-function-declaration'))());

        this.registerRule(new (require('./rules/require-spaces-in-call-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-call-expression'))());

        this.registerRule(new (require('./rules/validate-parameter-separator'))());

        this.registerRule(new (require('./rules/require-capitalized-constructors'))());

        this.registerRule(new (require('./rules/safe-context-keyword'))());

        this.registerRule(new (require('./rules/require-dot-notation'))());

        this.registerRule(new (require('./rules/require-space-after-line-comment'))());
        this.registerRule(new (require('./rules/disallow-space-after-line-comment'))());

        this.registerRule(new (require('./rules/require-anonymous-functions'))());
        this.registerRule(new (require('./rules/disallow-anonymous-functions'))());

        this.registerRule(new (require('./rules/require-function-declarations'))());
        this.registerRule(new (require('./rules/disallow-function-declarations'))());

        this.registerRule(new (require('./rules/require-capitalized-comments'))());
        this.registerRule(new (require('./rules/disallow-capitalized-comments'))());
    },

    /**
     * Get processed config
     * @return {Object}
     */
    getProcessedConfig: function() {
        return this._config;
    },

    /**
     * Loads configuration from JS Object. Activates and configures required rules.
     *
     * @param {Object} config
     */
    configure: function(config) {
        maxErrors(config, this);

        this.throwNonCamelCaseErrorIfNeeded(config);

        if (config.preset && !preset.exists(config.preset)) {
            throw new Error(preset.getDoesNotExistError(config.preset));
        }

        preset.extend(config);

        if (config.esnext) {
            this._esprima = harmonyEsprima;
        }

        var configRules = Object.keys(config);
        var activeRules = this._activeRules;

        this._config = config;
        this._rules.forEach(function(rule) {
            var ruleOptionName = rule.getOptionName();

            if (config.hasOwnProperty(ruleOptionName)) {

                // Do not configure the rule if it's equals to null (#203)
                if (config[ruleOptionName] !== null) {
                    rule.configure(config[ruleOptionName]);
                }
                activeRules.push(rule);
                configRules.splice(configRules.indexOf(ruleOptionName), 1);
            }
        });
        if (configRules.length > 0) {
            throw new Error('Unsupported rules: ' + configRules.join(', '));
        }
    },

    /**
     * Throws error for non camel-case options.
     *
     * @param {Object} config
     */
    throwNonCamelCaseErrorIfNeeded: function(config) {
        function symbolToUpperCase(s, symbol) {
            return symbol.toUpperCase();
        }
        function fixConfig(originConfig) {
            var result = {};
            for (var i in originConfig) {
                if (originConfig.hasOwnProperty(i)) {
                    var camelCaseName = i.replace(/_([a-zA-Z])/g, symbolToUpperCase);
                    var value = originConfig[i];
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        value = fixConfig(value);
                    }
                    result[camelCaseName] = value;
                }
            }
            return result;
        }
        var hasOldStyleConfigParams = false;
        for (var i in config) {
            if (config.hasOwnProperty(i)) {
                if (i.indexOf('_') !== -1) {
                    hasOldStyleConfigParams = true;
                    break;
                }
            }
        }
        if (hasOldStyleConfigParams) {
            throw new Error('JSCS now accepts configuration options in camel case. Sorry for inconvenience. ' +
                'On the bright side, we tried to convert your jscs config to camel case.\n' +
                '----------------------------------------\n' +
                JSON.stringify(fixConfig(config), null, 4) +
                '\n----------------------------------------\n');
        }
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
            tree = this._esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
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

            this._activeRules.forEach(function(rule) {
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

            if (!isNaN(this._maxErrors)) {
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
    }
};

module.exports = StringChecker;
