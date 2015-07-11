var vowFs = require('vow-fs');
var Vow = require('vow');
var StringChecker = require('./string-checker');
var utils = require('util');
var path = require('path');

var NodeConfiguration = require('./config/node-configuration');

/**
 * Starts Code Style checking process.
 *
 * @name Checker
 * @see StringChecker constructor
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
    StringChecker.prototype.configure.call(this, config);

    this._fileExtensions = this._configuration.getFileExtensions();
};

/**
 * Checks single file.
 *
 * @param {String} path
 * @returns {Promise.<Errors>}
 */
Checker.prototype.checkFile = function(path) {
    if (this._configuration.isFileExcluded(path)) {
        return Vow.resolve(null);
    }

    return vowFs.read(path, 'utf8').then(function(data) {
        return this.checkString(data, path);
    }, this);
};

/**
 * Fixes single file.
 *
 * @param {String} path
 * @returns {Promise.<Errors>}
 */
Checker.prototype.fixFile = function(path) {
    if (this._configuration.isFileExcluded(path)) {
        return Vow.resolve(null);
    }

    return vowFs.read(path, 'utf8').then(function(data) {
        var result = this.fixString(data, path);
        return vowFs.write(path, result.output).then(function() {
            return result.errors;
        });
    }, this);
};

/**
 * Checks directory recursively.
 *
 * @param {String} path
 * @returns {Promise.<Error[]>}
 */
Checker.prototype.checkDirectory = function(path) {
    return this._processDirectory(path, this.checkFile.bind(this));
};

/**
 * Checks directory or file.
 *
 * @param {String} path
 * @returns {Promise.<Error[]>}
 */
Checker.prototype.checkPath = function(path) {
    return this._processPath(path, this.checkFile.bind(this));
};

/**
 * Fixes directory or file.
 *
 * @param {String} path
 * @returns {Promise.<Error[]>}
 */
Checker.prototype.fixPath = function(path) {
    return this._processPath(path, this.fixFile.bind(this));
};

/**
 * Processes directory recursively.
 *
 * @param {String} path
 * @param {Function} fileHandler
 * @returns {Promise.<Error[]>}
 */
Checker.prototype._processDirectory = function(path, fileHandler) {
    return vowFs.listDir(path).then(function(filenames) {
        return Vow.all(filenames.map(function(filename) {
            var fullname = path + '/' + filename;

            if (this._configuration.isFileExcluded(fullname)) {
                return [];
            }

            return vowFs.stat(fullname).then(function(stat) {
                if (stat.isDirectory()) {
                    return this._processDirectory(fullname, fileHandler);
                }

                if (!this._hasCorrectExtension(fullname)) {
                    return [];
                }

                return Vow.when(fileHandler(fullname)).then(function(errors) {
                    if (errors) {
                        return errors;
                    }

                    return [];
                });
            }, this);
        }, this)).then(function(results) {
            return [].concat.apply([], results);
        });
    }, this);
};

/**
 * Processes directory or file.
 *
 * @param {String} path
 * @param {Function} fileHandler
 * @returns {Promise.<Error[]>}
 */
Checker.prototype._processPath = function(path, fileHandler) {
    path = path.replace(/\/$/, '');
    var _this = this;

    return vowFs.exists(path).then(function(exists) {
        if (!exists) {
            throw new Error('Path ' + path + ' was not found.');
        }

        return vowFs.stat(path).then(function(stat) {
            if (stat.isDirectory()) {
                return _this._processDirectory(path, fileHandler);
            }

            return fileHandler(path).then(function(errors) {
                if (errors) {
                    return [errors];
                }

                return [];
            });
        });
    });
};

/**
 * Checks stdin for input
 *
 * @returns {Promise}
 */
Checker.prototype.checkStdin = function() {
    return this._processStdin(this.checkString.bind(this));
};

/**
 * Fixes stdin input
 *
 * @returns {Promise}
 */
Checker.prototype.fixStdin = function() {
    return this._processStdin(this.fixString.bind(this));
};

/**
 *
 * @param {Function} stdinHandler
 * @returns {Promise}
 */
Checker.prototype._processStdin = function(stdinHandler) {
    var stdInput = [];
    var deferred = Vow.defer();

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
        stdInput.push(chunk);
    });

    process.stdin.on('end', function() {
        deferred.resolve(stdinHandler(stdInput.join('')));
    });

    return deferred.promise();
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

/**
 * Returns new configuration instance.
 *
 * @protected
 * @returns {NodeConfiguration}
 */
Checker.prototype._createConfiguration = function() {
    return new NodeConfiguration();
};

module.exports = Checker;
