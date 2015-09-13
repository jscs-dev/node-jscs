/**
 * Requires the first alphabetical character of a comment to be uppercase, unless it is part of a multi-line textblock.
 *
 * This rule automatically ignores jscs, jshint, eslint and istanbul specific comments.
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
 * 
 * // jscs: enable
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
 * "requireCapitalizedComments": { "allExcept": ["pragma"] }
 * ```
 *
 * Valid:
 *
 * ```js
 * function sayHello() {
 *     /* pragma something *\/
 *
 *     // I can now say hello in lots of statements, if I like.
 *     return "Hello";
 * }
 * ```
 *
 * Valid:
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
 * Invalid:
 *
 * ```js
 * function sayHello() {
 *     /* otherPragma something *\/
 *
 *     // i can now say hello in lots of statements, if I like.
 *     return "Hello";
 * }
 * ```
 *
 */

var assert = require('assert');

var isPragma = require('../utils').isPragma;

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        var exceptions;

        var optionName = this.getOptionName();

        var isObject = typeof options === 'object';

        assert(
            options === true ||
            isObject,
            optionName + ' option requires a true value ' +
            'or an object with String[] `allExcept` property'
        );

        if (isObject) {
            exceptions = options.allExcept;

            // verify items in `allExcept` property in object are string values
            assert(
                Array.isArray(exceptions) &&
                exceptions.every(function(el) { return typeof el === 'string'; }),
                'Property `allExcept` in ' + optionName + ' should be an array of strings'
            );

            this._isExcepted = isPragma(exceptions);
        } else {
            this._isExcepted = isPragma();
        }
    },

    getOptionName: function() {
        return 'requireCapitalizedComments';
    },

    check: function(file, errors) {
        var inTextBlock = null;
        var isExcepted = this._isExcepted;

        var letterPattern = require('../../patterns/L');
        var upperCasePattern = require('../../patterns/Lu');

        file.iterateTokensByType(['Line', 'Block'], function(comment, index, comments) {
            if (isExcepted(comment.value)) {
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
