var esprima = require('esprima');
var Errors = require('./errors');
var JsFile = require('./js-file');
var vowFs = require('vow-fs');
var Vow = require('vow');
var minimatch = require('minimatch');

/**
 * Starts Code Style checking process.
 * 
 * @name Checker
 */
var Checker = function() {
    this._rules = [];
    this._activeRules = [];
    this._excludes = null;
};

Checker.prototype = {
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
        this.registerRule(new (require('./rules/require-left-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-left-sticked-operators'))());
        this.registerRule(new (require('./rules/require-right-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-right-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-implicit-type-conversion'))());
        this.registerRule(new (require('./rules/disallow-keywords'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-breaks'))());
        this.registerRule(new (require('./rules/require-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/disallow-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/require-line-feed-at-file-end'))());
        this.registerRule(new (require('./rules/validate-jsdoc'))());
        this.registerRule(new (require('./rules/disallow-yoda-conditions'))());
        this.registerRule(new (require('./rules/require-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/require-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-quoted-keys-in-objects'))());
        this.registerRule(new (require('./rules/require-aligned-object-values'))());
    },

    /**
     * Loads configuration from JS Object. Activates and configures required rules.
     * 
     * @param {Object} config
     */
    configure: function(config) {
        this.throwNonCamelCaseErrorIfNeeded(config);
        var activeRules = this._activeRules;
        this._rules.forEach(function(rule) {
            var ruleOptionName = rule.getOptionName();
            if (config.hasOwnProperty(ruleOptionName)) {
                rule.configure(config[ruleOptionName]);
                activeRules.push(rule);
            }
        });
        this._excludes = (config.excludeFiles || []).map(function(pattern) {
            return new minimatch.Minimatch(pattern);
        });
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
    },

    /**
     * Checks single file.
     * 
     * @param {String} path
     * @returns {Promise * Errors}
     */
    checkFile: function(path) {
        var _this = this;
        if (this._shouldProcess(path) && path.match(/\.js$/)) {
            return vowFs.read(path, 'utf8').then(function (data) {
                return _this.checkString(data, path);
            });
        } else {
            return null;
        }
    },

    /**
     * Checks directory recursively.
     * 
     * @param {String} path
     * @returns {Promise * Error[]}
     */
    checkDirectory: function(path) {
        var _this = this;
        return vowFs.listDir(path).then(function(filenames) {
            return Vow.all(filenames.map(function(filename) {
                var fullname = path + '/' + filename;
                return vowFs.stat(fullname).then(function(stat) {
                    if (_this._shouldProcess(fullname)) {
                        if (stat.isDirectory()) {
                            return _this.checkDirectory(fullname);
                        } else if (fullname.match(/\.js$/)) {
                            return Vow.when(_this.checkFile(fullname)).then(function(errors) {
                                if (errors) {
                                    return errors;
                                } else {
                                    return [];
                                }
                            });
                        } else {
                            return [];
                        }
                    } else {
                        return [];
                    }
                });
            })).then(function(results) {
                return [].concat.apply([], results);
            });
        });
    },

    /**
     * Checks directory or file.
     * 
     * @param {String} path
     * @returns {Error[]}
     */
    checkPath: function(path) {
        path = path.replace(/\/$/, '');
        var _this = this;
        return vowFs.exists(path).then(function(exists) {
            if (exists) {
                return vowFs.stat(path).then(function(stat) {
                    if (stat.isDirectory()) {
                        return _this.checkDirectory(path);
                    } else {
                        return Vow.when(_this.checkFile(path)).then(function(errors) {
                            if (errors) {
                                return [errors];
                            } else {
                                return [];
                            }
                        });
                    }
                });
            } else {
                throw new Error('Path ' + path + ' was not found.');
            }
        });
    },

    /**
     * Returns true if specified path is not in exluded list.
     * 
     * @returns {Boolean}
     */
    _shouldProcess: function(path) {
        path = path.replace(/^\.\//, '');
        var excludes = this._excludes;
        for (var i = 0, l = excludes.length; i < l; i++) {
            if (excludes[i].match(path)) {
                return false;
            }
        }
        return true;
    }
};

module.exports = Checker;
