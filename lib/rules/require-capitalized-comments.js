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

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        // except comments that begin with `jscs`, since these are used to
        // selectively enable/disable rules within a file
        this._exceptions = {
            'jscs': true
        };

        var optionName = this.getOptionName();

        var isObject = typeof options === 'object';

        assert(
            options === true ||
            isObject,
            optionName + ' option requires a true value ' +
            'or an object with String[] `allExcept` property'
        );

        if (isObject) {
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
    },

    getOptionName: function() {
        return 'requireCapitalizedComments';
    },

    check: function(file, errors) {
        var inTextBlock = null;
        var exceptions = this._exceptions;

        var letterPattern = require('../../patterns/L');
        var upperCasePattern = require('../../patterns/Lu');

        file.iterateTokensByType(['Line', 'Block'], function(comment, index, comments) {
            // strip leading whitespace and any asterisks
            // split on whitespace and colons
            var splitComment = comment.value.replace(/(^\s+|[\*])/g, '').split(/[\s\:]/g);

            if (exceptions[splitComment[0]]) {
                return;
            }

            var stripped = comment.value.replace(/[\n\s\*]/g, '');
            var firstChar = stripped[0];
            var isLetter = firstChar && letterPattern.test(firstChar);

            if (!isLetter) {
                inTextBlock = false;
                return;
            }

            inTextBlock = inTextBlock &&
                comments[index - 1].type === 'Line' &&
                comments[index - 1].loc.start.line + 1 === comment.loc.start.line;

            var isUpperCase = upperCasePattern.test(firstChar);
            var isValid = isUpperCase || inTextBlock;

            if (!isValid) {
                errors.add(
                    'Comments must start with an uppercase letter, unless it is part of a textblock',
                    comment.loc.start
                );
            }

            inTextBlock = comment.type === 'Line';
        });
    }
};
