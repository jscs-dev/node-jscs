/**
 * Requires each element in array on a single line when array length is more than passed maximum
 * number or array fills more than one line.
 * Set `ignoreBrackets` to `true` to allow elements on the same line with brackets.
 *
 * Type: `Boolean` or `Number` (maximum) or `Object` (`{maximum: Number, ignoreBrackets: Boolean}`)
 *
 * Values: `true`
 *
 * Default: `{maximum: Infinity, ignoreBrackets: false}`
 *
 * #### Example
 *
 * ```js
 * "validateNewlineAfterArrayElements": {
 *   "maximum": 3
 * }
 * ```
 *
 * ##### Valid for `true`
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
 * ##### Invalid for `true`
 *
 * ```js
 * var x = [1,
 *   2];
 * ```
 *
 * ##### Valid for `3`
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
 * ##### Invalid for `3`
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
 * ##### Valid for `{maximum: 2, ignoreBrackets: true}`
 *
 * ```js
 * var x = [{a: 1}, [2]];
 * var x = [1,
 *   2,
 *   3];
 * ```
 *
 * ##### Invalid for `{maximum: 2, ignoreBrackets: true}`
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
