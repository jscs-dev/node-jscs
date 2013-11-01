var esprima = require('esprima');
var Errors = require('./errors');
var JsFile = require('./js-file');
var path = require('path');
var fs = require('fs');

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
     * Find and register rules
     * @param {String} [dir] if omitted, default rules folder will be used
     */
    registerRulesInDir: function( dir ) {
        dir = dir ? path.resolve(process.cwd(), dir) : path.join(__dirname, 'rules');

        fs.readdirSync(dir).forEach(function(file) {
            if (path.extname(file) !== '.js') { 
                return; 
            }

            var Rule = require(path.join(dir, file));
            this.registerRule(new Rule());
        }, this);
    },

    /**
     * Registers built-in Code Style cheking rules.
     */
    registerDefaultRules: function() {
        // Deprecated rules:
        // require-left-sticked-operators
        // disallow-left-sticked-operators
        // require-right-sticked-operators
        // disallow-right-sticked-operators

        this.registerRulesInDir();
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
