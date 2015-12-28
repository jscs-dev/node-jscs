/**
 * Requires identifiers to be camelCased or UPPERCASE_WITH_UNDERSCORES
 *
 * Types: `Boolean` or `String` or `Object`
 *
 * Values:
 *
 * - `true`
 * - `"ignoreProperties"` allows an exception for object property names. Deprecated, Please use the `Object` value
 * - `Object`:
 *    - `ignoreProperties`:  boolean that allows an exception for object property names
 *    - `strict`: boolean that forces the first character to not be capitalized
 *    - `allowedPrefixes`: array of String or RegExp values permitted as prefixes before `_`
 *    - `allowedSuffixes`: array of String or RegExp values permitted as suffixes after `_`
 *
 * JSHint: [`camelcase`](http://jshint.com/docs/options/#camelcase)
 *
 * #### Example
 *
 * ```js
 * "requireCamelCaseOrUpperCaseIdentifiers": true
 *
 * "requireCamelCaseOrUpperCaseIdentifiers": {"ignoreProperties": true, "strict": true}
 *
 * "requireCamelCaseOrUpperCaseIdentifiers": {"allowedPrefixes": ["opt", /pfx\d+/]}
 *
 * "requireCamelCaseOrUpperCaseIdentifiers": {"allowedSuffixes": ["dCel", /[kMG]?Hz/]}
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * ```
 *
 * ##### Valid for mode `ignoreProperties`
 *
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var obj.snake_case = 5;
 * var camelCase = { snake_case: 6 };
 * ```
 *
 * ##### Invalid for mode `ignoreProperties`
 *
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * var snake_case = { snake_case: 6 };
 * ```
 *
 * ##### Valid for mode `strict`
 *
 * ```js
 * var camelCase = 0;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var obj.snake_case = 5;
 * var camelCase = { snake_case: 6 };
 * ```
 *
 * ##### Invalid for mode `strict`
 *
 * ```js
 * var Mixed_case = 2;
 * var Snake_case = { snake_case: 6 };
 * var snake_case = { SnakeCase: 6 };
 * ```
 *
 * ##### Valid for `{ allowedPrefix: ["opt", /pfx\d+/] }`
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var opt_camelCase = 5;
 * var pfx32_camelCase = 6;
 * ```
 *
 * ##### Invalid for `{ allowedPrefix: ["opt", /pfx\d+/] }`
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * var req_camelCase = 4;
 * var pfx_CamelCase = 5;
 * ```
 *
 * ##### Valid for `{ allowedSuffixes: ["dCel", /[kMG]?Hz/] }`
 * ```js
 * var camelCase = 0;
 * var CamelCase = 1;
 * var _camelCase = 2;
 * var camelCase_ = 3;
 * var UPPER_CASE = 4;
 * var camelCase_dCel = 5;
 * var _camelCase_MHz = 6;
 * ```
 *
 * ##### Invalid for `{ allowedSuffixes: ["dCel", /[kMG]?Hz/] }`
 * ```js
 * var lower_case = 1;
 * var Mixed_case = 2;
 * var mixed_Case = 3;
 * var camelCase_cCel = 4;
 * var CamelCase_THz = 5;
 * ```
 */

var assert = require('assert');

// Helper for validating allowedPrefixes/allowedSuffixes
function isArrayOfStringOrRegExp(arr) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.reduce(function(pv, cv) {
        return pv && (typeof cv === 'string' || cv instanceof RegExp);
    }, true);
}

// Return undefined or the start of the unprefixed value.
function startAfterStringPrefix(value, prefix) {
    var start = prefix.length + 1;
    if (start >= value.length) {
        return;
    }
    if (value.charAt(prefix.length) !== '_') {
        return;
    }
    if (value.substr(0, prefix.length) !== prefix) {
        return;
    }
    return start;
}

// Return undefined or the start of the unprefixed value.
function startAfterRegExpPrefix(value, prefix) {
    var match = prefix.exec(value);
    if (!match) {
        return;
    }
    if (match.index !== 0) {
        return;
    }
    var start = match[0].length + 1;
    if (start >= value.length) {
        return;
    }
    if (value.charAt(match[0].length) !== '_') {
        return;
    }
    return start;
}

// Return undefined or the end of the unsuffixed value.
function endBeforeStringSuffix(value, suffix) {
    var ends = value.length - (1 + suffix.length);
    if (ends <= 0) {
        return;
    }
    if (value.charAt(ends) !== '_') {
        return;
    }
    if (value.substr(ends + 1) !== suffix) {
        return;
    }
    return ends;
}

// Return undefined or the end of the unsuffixed value.
function endBeforeRegExpSuffix(value, suffix) {
    var match = suffix.exec(value);
    if (!match) {
        return;
    }
    var ends = match.index - 1;
    if (ends <= 0) {
        return;
    }
    if (value.charAt(ends) !== '_') {
        return;
    }
    if ((ends + 1 + match[0].length) !== value.length) {
        return;
    }
    return ends;
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        if (typeof options !== 'object') {
            assert(
              options === true || options === 'ignoreProperties',
              this.getOptionName() + ' option requires a true value or `ignoreProperties`'
            );
            var _options = {
                ignoreProperties: options === 'ignoreProperties' ? true : false,
                strict: false
            };
            return this.configure(_options);
        }

        assert(
          !options.hasOwnProperty('ignoreProperties') || typeof options.ignoreProperties === 'boolean',
          this.getOptionName() + ' option should have boolean value for ignoreProperties'
        );
        this._ignoreProperties = options.ignoreProperties;

        assert(
          !options.hasOwnProperty('strict') || typeof options.strict === 'boolean',
          this.getOptionName() + ' option should have boolean value for strict'
        );
        this._strict = options.strict;

        assert(
          !options.hasOwnProperty('allowedPrefixes') || isArrayOfStringOrRegExp(options.allowedPrefixes),
          this.getOptionName() + ' option should have array of string or RegExp for allowedPrefixes'
        );
        if (Array.isArray(options.allowedPrefixes)) {
            this._allowedPrefixes = options.allowedPrefixes;
        }

        assert(
          !options.hasOwnProperty('allowedSuffixes') || isArrayOfStringOrRegExp(options.allowedSuffixes),
          this.getOptionName() + ' option should have array of string or RegExp for allowedSuffixes'
        );
        if (Array.isArray(options.allowedSuffixes)) {
            this._allowedSuffixes = options.allowedSuffixes;
        }
    },

    getOptionName: function() {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;

            // Leading and trailing underscores signify visibility/scope and do not affect
            // validation of the rule.  Remove them to simplify the checks.
            var isPrivate = (value[0] === '_');
            value = value.replace(/^_+|_+$/g, '');

            // Strip at most one prefix permitted text and underscore from the identifier.  This
            // transformation cannot change an acceptable identifier into an unacceptable
            // identifier so we can continue with the normal verification of whatever it produces.
            var i;
            var len;
            if (this._allowedPrefixes) {
                for (i = 0, len = this._allowedPrefixes.length; i < len; ++i) {
                    var prefix = this._allowedPrefixes[i];
                    var start;
                    if (typeof prefix === 'string') {
                        start = startAfterStringPrefix(value, prefix);
                    } else {
                        start = startAfterRegExpPrefix(value, prefix);
                    }
                    if (start !== undefined) {
                        value = value.substr(start);
                        break;
                    }
                }
            }

            // As with prefix but for a suffix underscore and permitted text.
            if (this._allowedSuffixes) {
                for (i = 0, len = this._allowedSuffixes.length; i < len; ++i) {
                    var suffix = this._allowedSuffixes[i];
                    var ends;
                    if (typeof suffix === 'string') {
                        ends = endBeforeStringSuffix(value, suffix);
                    } else {
                        ends = endBeforeRegExpSuffix(value, suffix);
                    }
                    if (ends !== undefined) {
                        value = value.substr(0, ends);
                        break;
                    }
                }
            }

            if (value.indexOf('_') === -1 || value.toUpperCase() === value) {
                if (!this._strict) {return;}
                if (value.length === 0 || value[0].toUpperCase() !== value[0] || isPrivate) {
                    return;
                }
            }
            if (this._ignoreProperties) {
                var nextToken = file.getNextToken(token);
                var prevToken = file.getPrevToken(token);

                if (nextToken && nextToken.value === ':') {
                    return;
                }

                /* This enables an identifier to be snake cased via the object
                 * destructuring pattern. We must check to see if the identifier
                 * is being used to set values into an object to determine if
                 * this is a legal assignment.
                 * Example: ({camelCase: snake_case}) => camelCase.length
                 */
                if (prevToken && prevToken.value === ':') {
                    var node = file.getNodeByRange(token.range[0]);
                    var parentNode = node.parentNode;
                    if (parentNode && parentNode.type === 'Property') {
                        var grandpa = parentNode.parentNode;
                        if (grandpa && grandpa.type === 'ObjectPattern') {
                            return;
                        }
                    }
                }

                if (prevToken && (prevToken.value === '.' ||
                    prevToken.value === 'get' || prevToken.value === 'set')) {
                    return;
                }
            }
            errors.add(
                'All identifiers must be camelCase or UPPER_CASE',
                token.loc.start.line,
                token.loc.start.column
            );
        }.bind(this));
    }

};
