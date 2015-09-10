/**
 * Requires the first alphabetical character of a comment to be uppercase, unless it is part of a multi-line textblock.
 *
 * By default, the prefix for inline comments `jscs` is ignored.
 *
 * Types: `Boolean` or `Object`
 *
 * Values:
 *  - `true`
 *  - `Object`:
 *     - `allExcept`: array of quoted exceptions
 *
 * #### Example
 *
 * `"requireCapitalizedComments": true`
 *
 * Valid:
 * ```js
 * // Valid
 * //Valid
 *
 * /*
 *   Valid
 *  *\/
 *
 * /**
 *  * Valid
 *  *\/
 *
 * // A textblock is a set of lines
 * // that starts with a capitalized letter
 * // and has one or more non-capitalized lines
 * // afterwards
 *
 * // A textblock may also have multiple lines.
 * // Those lines can be uppercase as well to support
 * // sentense breaks in textblocks
 *
 * // 123 or any non-alphabetical starting character
 * // @are also valid anywhere
 * ```
 *
 * Invalid:
 * ```js
 * // invalid
 * //invalid
 * /** invalid *\/
 * /**
 *  * invalid
 *  *\/
 * ```
 *
 * ```js
 * "requireCapitalizedComments": { "allExcept": ["jshint"] }
 * ```
 *
 * Valid:
 *
 * ```js
 * function sayHello() {
 *     /* jshint: -W071 *\/
 *
 *     // I can now say hello in lots of statements, if I like.
 *     return "Hello";
 * }
 * ```
 *
 * * Invalid:
 *
 * ```js
 * function sayHello() {
 *     /* jshint: -W071 *\/
 *
 *     // i can now say hello in lots of statements, if I like.
 *     return "Hello";
 * }
 * ```
 *
 * * Invalid:
 *
 * ```js
 * function sayHello() {
 *     /* istanbul ignore next *\/
 *
 *     // I'd like to ignore this statement in coverage reports.
 *     return "Hello";
 * }
 * ```
 *
 */

var assert = require('assert');

var letterPattern = require('../../patterns/L');
var upperCasePattern = require('../../patterns/Lu');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        // except comments that begin with `jscs`, since these are used to
        // selectively enable/disable rules within a file
        this._exceptions = {
            'jscs': true
        };

        this._ignoreIfInTheMiddle = false;

        var optionName = this.getOptionName();

        var isObject = typeof options === 'object';
        var error = optionName + ' option requires a true value ' +
            'or an object with String[] `allExcept` property or true with `ignoreIfInTheMiddle`';

        assert(
            options === true ||
            isObject,
            error
        );

        if (isObject && options.allExcept) {
            var exceptions = options.allExcept;

            // verify items in `allExcept` property in object are string values
            assert(
                Array.isArray(exceptions) &&
                exceptions.every(function(el) { return typeof el === 'string'; }),
                'Property `allExcept` in ' + optionName + ' should be an array of strings'
            );

            for (var i = 0, l = exceptions.length; i < l; i++) {
                this._exceptions[exceptions[i]] = true;
            }
        }

        if (isObject && options.ignoreIfInTheMiddle) {
            this._ignoreIfInTheMiddle = true;
        }

        if (isObject && !options.allExcept && !options.ignoreIfInTheMiddle) {
            assert(false, error);
        }
    },

    getOptionName: function() {
        return 'requireCapitalizedComments';
    },

    _isException: function(comment) {
        // Strip leading whitespace and any asterisks
        // split on whitespace and colons
        var splitComment = comment.value.replace(/(^\s+|[\*])/g, '').split(/[\s\:]/g);

        return this._exceptions[splitComment[0]];
    },

    _isUrl: function(comment) {
        var protocolParts = comment.value.split('://');

        if (protocolParts.length === 1) {
            return false;
        }

        return comment.value.indexOf(protocolParts[0]) === 0;
    },

    _isValid: function(comment) {
        var first = this._getFirstChar(comment);

        return first && upperCasePattern.test(first);
    },

    _isLetter: function(comment) {
        var first = this._getFirstChar(comment);

        return first && letterPattern.test(first);
    },

    _getFirstChar: function(comment) {
        return comment.value.replace(/[\n\s\*]/g, '')[0];
    },

    _isTextBlock: function(comment, comments, index) {
        var prevComment = comments[index - 1];

        if (prevComment) {
            return prevComment.type === 'Line' &&
                prevComment.loc.start.line + 1 === comment.loc.start.line &&
                prevComment.value.trim().length > 0;
        }

        return false;
    },

    _shouldIgnoreIfInTheMiddle: function(file, comment) {
        if (!this._ignoreIfInTheMiddle) {
            return false;
        }

        var firstToken = file.getFirstNodeToken(comment);
        var otherToken = file.getPrevToken(firstToken, { includeComments: true });

        return otherToken.loc.start.line === firstToken.loc.start.line;
    },

    check: function(file, errors) {
        var _this = this;

        function add(comment) {
            errors.add(
                'Comments must start with an uppercase letter, unless it is part of a textblock',
                comment.loc.start
            );
        }

        file.iterateTokensByType('Line', function(comment, index, comments) {
            if (_this._isException(comment)) {
                return;
            }

            if (_this._isUrl(comment)) {
                return;
            }

            if (!_this._isLetter(comment)) {
                return;
            }

            if (_this._isTextBlock(comment, comments, index)) {
                return;
            }

            if (_this._isValid(comment)) {
                return;
            }

            add(comment);
        });

        file.iterateTokensByType('Block', function(comment, index, comments) {
            if (_this._isException(comment)) {
                return;
            }

            if (_this._isUrl(comment)) {
                return;
            }

            if (!_this._isLetter(comment)) {
                return;
            }

            if (_this._shouldIgnoreIfInTheMiddle(file, comment)) {
                return;
            }

            if (_this._isValid(comment, index, comments)) {
                return;
            }

            add(comment);
        });
    }
};
