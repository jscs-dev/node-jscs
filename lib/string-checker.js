var esprima = require('esprima');
var Errors = require('./errors');
var JsFile = require('./js-file');

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 */
var StringChecker = function() {
    this._rules = [];
    this._activeRules = [];
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
        this.registerRule(new (require('./rules/require-space-after-keywords'))());
        this.registerRule(new (require('./rules/disallow-space-after-keywords'))());

        /* deprecated rules */
        this.registerRule(new (require('./rules/require-left-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-left-sticked-operators'))());
        this.registerRule(new (require('./rules/require-right-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-right-sticked-operators'))());
        /* deprecated rules (end) */

        this.registerRule(new (require('./rules/disallow-implicit-type-conversion'))());
        this.registerRule(new (require('./rules/disallow-keywords'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-breaks'))());
        this.registerRule(new (require('./rules/validate-line-breaks'))());
        this.registerRule(new (require('./rules/require-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/disallow-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/require-line-feed-at-file-end'))());
        this.registerRule(new (require('./rules/validate-jsdoc'))());
        this.registerRule(new (require('./rules/disallow-yoda-conditions'))());
        this.registerRule(new (require('./rules/require-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/require-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-parentheses'))());
        this.registerRule(new (require('./rules/require-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-quoted-keys-in-objects'))());
        this.registerRule(new (require('./rules/require-aligned-object-values'))());

        this.registerRule(new (require('./rules/disallow-space-before-postfix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-before-postfix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-after-prefix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-after-prefix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-before-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-before-binary-operators'))());

        this.registerRule(new (require('./rules/disallow-space-after-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-after-binary-operators'))());

        this.registerRule(new (require('./rules/require-spaces-in-function-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-function-expression'))());

        this.registerRule(new (require('./rules/safe-context-keyword'))());
    },

    /**
     * Loads configuration from JS Object. Activates and configures required rules.
     *
     * @param {Object} config
     */
    configure: function(config) {
        this.throwNonCamelCaseErrorIfNeeded(config);

        var configRules = Object.keys(config);
        var activeRules = this._activeRules;
        this._rules.forEach(function(rule) {
            var ruleOptionName = rule.getOptionName();
            if (config.hasOwnProperty(ruleOptionName)) {
                rule.configure(config[ruleOptionName]);
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
        var tree;
        str = str.replace(/^#![^\n]+\n/, '\n');
        try {
            tree = esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
        } catch (e) {
            throw new Error('Syntax error at ' + filename + ': ' + e.message);
        }
        var file = new JsFile(filename, str, tree);
        var errors = new Errors(file);
        this._activeRules.forEach(function(rule) {
            rule.check(file, errors);
        });
        return errors;
    }
};

module.exports = StringChecker;
