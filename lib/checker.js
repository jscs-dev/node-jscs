var vowFs = require('vow-fs');
var Vow = require('vow');
var StringChecker = require('./string-checker');
var utils = require('util');
var path = require('path');

var additionalRules = require('./options/additional-rules');
var excludeFiles = require('./options/exclude-files');
var fileExtensions = require('./options/file-extensions');

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 */
var Checker = function() {
    StringChecker.apply(this, arguments);
};

utils.inherits(Checker, StringChecker);

/**
 * Loads configuration from JS Object. Activates and configures required rules.
 *
 * @param {Object} config
 */
Checker.prototype.configure = function(config) {
    var cwd = config.configPath ? path.dirname(config.configPath) : process.cwd();

    fileExtensions(config, this);
    excludeFiles(config, this, cwd);
    additionalRules(config, this, cwd);

    StringChecker.prototype.configure.apply(this, arguments);
};

/**
 * Checks single file.
 *
 * @param {String} path
 * @returns {Promise * Errors}
 */
Checker.prototype.checkFile = function(path) {
    var _this = this;

    if (!_this._isExcluded(path)) {
        return vowFs.read(path, 'utf8').then(function(data) {
            return _this.checkString(data, path);
        });
    }

    var defer = Vow.defer();
    defer.resolve(null);

    return defer.promise();
};

/**
 * Checks directory recursively.
 *
 * @param {String} path
 * @returns {Promise * Error[]}
 */
Checker.prototype.checkDirectory = function(path) {
    var _this = this;

    return vowFs.listDir(path).then(function(filenames) {
        return Vow.all(filenames.map(function(filename) {
            var fullname = path + '/' + filename;

            // check for exclude path
            if (_this._isExcluded(fullname)) {
                return [];
            }

            return vowFs.stat(fullname).then(function(stat) {
                if (stat.isDirectory()) {
                    return _this.checkDirectory(fullname);
                }

                if (!_this._hasCorrectExtension(fullname)) {
                    return [];
                }

                return Vow.when(_this.checkFile(fullname)).then(function(errors) {
                    if (errors) {
                        return errors;
                    }

                    return [];
                });
            });
        })).then(function(results) {
            return [].concat.apply([], results);
        });
    });
};

/**
 * Checks directory or file.
 *
 * @param {String} path
 * @returns {Error[]}
 */
Checker.prototype.checkPath = function(path) {
    path = path.replace(/\/$/, '');
    var _this = this;

    return vowFs.exists(path).then(function(exists) {
        if (!exists) {
            throw new Error('Path ' + path + ' was not found.');
        }

        return vowFs.stat(path).then(function(stat) {
            if (stat.isDirectory()) {
                return _this.checkDirectory(path);
            }

            return _this.checkFile(path).then(function(errors) {
                if (errors) {
                    return [errors];
                }

                return [];
            });
        });
    });
};

/**
 * Returns true if specified path is in excluded list.
 *
 * @returns {Boolean}
 */
Checker.prototype._isExcluded = function(testPath) {
    testPath = path.resolve(testPath);

    return !this._excludes.every(function(exclude) {
        return !exclude.match(testPath);
    });
};

/**
 * Returns true if the file extension matches a file extension to process.
 *
 * @returns {Boolean}
 */
Checker.prototype._hasCorrectExtension = function(testPath) {
    var extension = path.extname(testPath).toLowerCase();
    var basename = path.basename(testPath).toLowerCase();

    return !(
        this._fileExtensions.indexOf(extension) < 0 &&
        this._fileExtensions.indexOf(basename) < 0 &&
        this._fileExtensions.indexOf('*') < 0
    );
};

module.exports = Checker;
