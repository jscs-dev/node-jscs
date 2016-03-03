/**
 * Requires `'use strict';` statements
 *
 * Values:
 *  - `true` for default behavior (require 'use strict' statements for files)
 *
 * #### Example
 *
 * ```js
 * "requireUseStrict": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * 'use strict';
 * // code
 * ```
 *
 * ```js
 * // comment line or block
 * 'use strict';
 * // code
 * ```
 *
 * ```js
 * // comment line or block
 *
 * 'use strict';
 * // code
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * // code
 * ```
 */

var assert = require('assert');
var ignoreTokens = [
    "CommentLine",
    "CommentBlock",
    "Whitespace",
    "ReturnStatement"
];


module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        if (typeof options !== 'object') {
            assert(
                options === true,
                this.getOptionName() + ' option requires either a true value or an object'
            );

            var _options = {files: true};
            return this.configure(_options);
        }

        this._checkFiles = (options.files === true);
    },

    getOptionName: function() {
        return 'requireUseStrict';
    },

    check: function(file, errors) {
        var checkFiles = this._checkFiles;

        if (checkFiles) {
          checkScope(file.getProgram());
        }

        function checkScope(node) {
            var scope =  node.childElements
                        .filter(function(ele) {
                            return (ignoreTokens.indexOf(ele.type) === -1);
                        });

            var expression = (scope[0] || {}).expression || {};
            if (expression.value === 'use strict') {
                return;
            }

            errors.add(
                '`"use strict";` is required at the top of each file',
                node
            );
        }
    }
};
