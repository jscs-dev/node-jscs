/**
 * Requires each element in array on a single line when array length is more than passed maximum
 * number or array fills more than one line.
 *
 * Types: `Boolean`, `Integer`, `Object`
 *
 * Values:
 *  - `true`: setting this is the same as validating the rule using `{maximum: Infinity, ignoreBrackets: false}`
 *  - `Integer`: setting this is the same as validating the rule using `{maximum: Integer, ignoreBrackets: false}`
 *  - `Object`:
 *      - `maximum`
 *          - `Integer` specifies the maximum number of elements that a single line array can contain
 *      - `ignoreBrackets`
 *          - `true` specifies that the `[` and `]` brackets can be placed on the same line as the array elements
 *
 * #### Example
 *
 * ```js
 * "validateNewlineAfterArrayElements": {
 *   "maximum": 3
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var x = [{a: 1}, [2], '3', 4, 5, 6];
 * var x = [
 *   {a: 1},
 *   [2],
 *   '3',
 *   4
 * ];
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var x = [1,
 *   2];
 * ```
 *
 * ##### Valid for mode `3`
 *
 * ```js
 * var x = [{a: 1}, [2], '3'];
 * var x = [
 *   1,
 *   2,
 *   3,
 *   4
 * ];
 * ```
 *
 * ##### Invalid for mode `3`
 *
 * ```js
 * var x = [1, 2, 3, 4];
 * var x = [1,
 *   2,
 *   3];
 * var x = [
 *     1, 2
 * ];
 * ```
 *
 * ##### Valid for mode `{maximum: 2, ignoreBrackets: true}`
 *
 * ```js
 * var x = [{a: 1}, [2]];
 * var x = [1,
 *   2,
 *   3];
 * ```
 *
 * ##### Invalid for mode `{maximum: 2, ignoreBrackets: true}`
 *
 * ```js
 * var x = [1, 2, 3];
 * var x = [1, 2,
 *   3];
 * var x = [1,
 *   2, 3];
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(opts) {
        assert(
            opts === true ||
            typeof opts === 'number' && opts >= 1 ||
            typeof opts === 'object',
            this.getOptionName() + ' option requires maximal number of items ' +
                'or true value either should be removed'
        );
        if (typeof opts === 'object') {
            this._options = opts;

            if ('maximum' in opts) {
                assert(typeof opts.maximum === 'number' && opts.maximum >= 1,
                    'maximum property requires a positive number or should be removed');
            } else {
                opts.maximum = Infinity;
            }

            if ('ignoreBrackets' in opts) {
                assert(opts.ignoreBrackets === true,
                    'ignoreBrackets property requires true value or should be removed');
            } else {
                opts.ignoreBrackets = false;
            }

        } else {
            this._options = {
                maximum: opts === true ? Infinity : opts,
                ignoreBrackets: false
            };
        }
    },

    getOptionName: function() {
        return 'validateNewlineAfterArrayElements';
    },

    check: function(file, errors) {
        var maximum = this._options.maximum;
        var ignoreBrackets = this._options.ignoreBrackets;

        file.iterateNodesByType(['ArrayExpression'], function(node) {
            var els = node.elements;
            if (els.length <= maximum && node.loc.start.line === node.loc.end.line) {
                return;
            }

            if (!ignoreBrackets) {
                if (els[0] && els[0].loc.start.line === node.loc.start.line) {
                    errors.add('First element should be placed on new line', els[0].loc.start);
                }
                if (els[els.length - 1] && els[els.length - 1].loc.end.line === node.loc.end.line) {
                    errors.add('Closing bracket should be placed on new line', node.loc.end);
                }
            }

            var prevLine = 0;
            els.forEach(function(elem) {
                if (!elem) {
                    // skip holes
                    return;
                }
                var line = elem.loc.start.line;
                if (prevLine === line) {
                    errors.add('Multiple elements at a single line in multiline array', {
                        line: line,
                        column: elem.loc.start.column
                    });
                }
                prevLine = line;
            });

        });
    }
};
