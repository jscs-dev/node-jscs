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
        var program = file.getProgram();
        var directive = program.directives[0];

        if (directive) {
            return;
        }

        errors.add(
            '`"use strict";` is required at the top of each file',
            program
        );
    }
};
