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
Checker.prototype.configure = function(/*config*/) {
    StringChecker.prototype.configure.apply(this, arguments);

    this._fileExtensions = this._configuration.getFileExtensions();
};

/**
 * Checks single file.
 *
 * @param {String} path
 * @returns {Promise * Errors}
 */
Checker.prototype.checkFile = function(path) {
    if (!this._configuration.isFileExcluded(path)) {
        return vowFs.read(path, 'utf8').then(function(data) {
            return this.checkString(data, path);
        }, this);
    }

    return Vow.resolve(null);
};

/**
 * Checks directory recursively.
 *
 * @param {String} path
 * @returns {Promise * Error[]}
 */
Checker.prototype.checkDirectory = function(path) {
    return vowFs.listDir(path).then(function(filenames) {
        return Vow.all(filenames.map(function(filename) {
            var fullname = path + '/' + filename;

            if (this._configuration.isFileExcluded(fullname)) {
                return [];
            }

            return vowFs.stat(fullname).then(function(stat) {
                if (stat.isDirectory()) {
                    return this.checkDirectory(fullname);
                }

                if (!this._hasCorrectExtension(fullname)) {
                    return [];
                }

                return Vow.when(this.checkFile(fullname)).then(function(errors) {
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
 * Checks stdin for input
 *
 * @returns {Promise}
 */
Checker.prototype.checkStdin = function() {
    var stdInput = [];
    var deferred = Vow.defer();
    var _this = this;

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
        stdInput.push(chunk);
    });

    process.stdin.on('end', function() {
        var errors = _this.checkString(stdInput.join(''));

        deferred.resolve(errors);
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
 * @returns {Configuration}
 */
Checker.prototype._createConfiguration = function() {
    return new NodeConfiguration();
};

module.exports = Checker;
