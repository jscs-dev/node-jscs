/**
 * Requires blocks to begin and end with a newline
 *
 * Types: `Boolean`, `Integer`, `Object`
 *
 * Values:
 *  - `true` validates all non-empty blocks
 *  - `Integer` specifies a minimum number of lines containing elements in the block before validating
 *  - `Object`:
 *      - `'includeComments'`
 *          - `true` includes comments as part of the validation
 *      - `'minLines'`
 *          - `Integer` specifies a minimum number of lines containing elements in the block before validating
 *
 * #### Examples
 *
 * ```js
 * "requireBlocksOnNewline": true
 * "requireBlocksOnNewline": 1
 * "requireBlocksOnNewline": {
 *      "includeComments": true
 * }
 * "requireBlocksOnNewline": {
 *      "includeComments": true,
 *      "minLines": 1
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * if (true) {
 *     doSomething();
 * }
 * var abc = function() {};
 * // or
 * if (true) { //comments
 *     doSomething();
 * }
 * var abc = function() {};
 * // or
 * if (true) {
 *     doSomething();
 * /** comments *\/
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) {doSomething();}
 * ```
 *
 * ##### Valid for mode `1`
 *
 * ```js
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * // or
 * if (true) { //comments
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ```js
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 *     /** comments *\/
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) { doSomething(); doSomethingElse(); }
 * ```
 *
 * ##### Valid for mode `{ includeComments: true }`
 *
 * ```js
 * if (true) {
 *     //comments
 *     doSomething();
 * }
 * var abc = function() {};
 * // or
 * if (true) {
 *     doSomething();
 *      //comments
 * }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true) { //comments
 *     doSomething();
 * }
 * var abc = function() {};
 * // or
 * if (true) {
 *     doSomething();
 * /** comments *\/}
 * var abc = function() {};
 * ```
 *
 * ##### Valid for mode `{ includeComments: true, minLines: 1 }`
 *
 * ```js
 * if (true) {
 *     //comments
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * // or
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 *     //comments
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 * ##### Invalid
 * ```js
 * if (true) { //comments
 *     doSomething();
 *     doSomethingElse();
 * }
 * if (true) { doSomething(); }
 * var abc = function() {};
 * // or
 * if (true) {
 *     doSomething();
 *     doSomethingElse();
 *     /** comments *\/}
 * if (true) { doSomething(); }
 * var abc = function() {};
 * ```
 *
 */

var assert = require('assert');

function hasCommentInBlock(block) {
    for (var i = 0; i < block.childElements.length; i++) {
        if (block.childElements[i].isComment) {
            return true;
        }
    }
    return false;
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var optionType = typeof options;
        assert(
            options === true || optionType === 'number' || optionType === 'object',
            this.getOptionName() + ' option requires the value true, an Integer or an object'
        );

        this._minLines = 0;
        this._includeComments = false;
        if (optionType === 'number') {
            this._minLines = options;
        } else if (optionType === 'object') {
            assert(
                options.includeComments === true,
                this.getOptionName() + ' option requires includeComments property to be true for object'
            );
            this._includeComments = options.includeComments;

            if (options.hasOwnProperty('minLines')) {
                assert(
                    typeof options.minLines === 'number',
                    this.getOptionName() + ' option requires minLines property to be an integer for object'
                );
                this._minLines = options.minLines;
            }
        }

        assert(
            this._minLines >= 0,
            this.getOptionName() + ' option requires minimum statements setting to be >= 0'
        );
    },

    getOptionName: function() {
        return 'requireBlocksOnNewline';
    },

    check: function(file, errors) {
        var minLines = this._minLines;
        var includeComments = this._includeComments;

        file.iterateNodesByType('BlockStatement', function(node) {
            var hasComment = false;
            if (includeComments === true) {
                hasComment = hasCommentInBlock(node);
            }

            if (hasComment === false && node.body.length <= minLines) {
                return;
            }

            var openingBracket = node.getFirstToken();
            var nextToken = file.getNextToken(openingBracket, { includeComments: includeComments });

            errors.assert.differentLine({
                token: openingBracket,
                nextToken: nextToken,
                message: 'Missing newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getPrevToken(closingBracket, { includeComments: includeComments });

            errors.assert.differentLine({
                token: prevToken,
                nextToken: closingBracket,
                message: 'Missing newline before closing curly brace'
            });
        });
    }

};
