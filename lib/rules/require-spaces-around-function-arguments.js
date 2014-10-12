var assert = require('assert');

function Check(node, file, options) {
    this.node = node;
    this.file = file;
    this.options = options;
}

Check.prototype = {
    constructor: Check,

    checkArity: function() {
        var arity = this.options.arity;

        if (!arity) {
            return true;
        }

        if (arity.indexOf('<') === 0) {
            return this.node.arguments.length < this.options.arity.split('<')[1];
        }

        if (arity.indexOf('>') === 0) {
            return this.node.arguments.length > this.options.arity.split('>')[1];
        }

        return this.node.arguments.length === +this.options.arity;
    },

    isSingleLine: function() {
        var isSingleLine = this.node.loc.start.line === this.node.loc.end.line;

        return this.checkArity() && isSingleLine;
    },

    isMultiLine: function() {
        return !this.isSingleLine();
    },

    isAcceptableSingleLine: function() {
        if (!this.options) {
            return false;
        }

        return this.checkArity() && this.isSingleLine();
    },

    isAcceptableMultiline: function() {
        if (!this.options) {
            return false;
        }

        return this.checkArity() && this.isMultiLine();
    },

    isException: function(value) {
        if (!this.options || !this.options.except) {
            return false;
        }

        value = value.value;

        var exceptions = this.options.except.length;
        var l = exceptions.length;
        var i = 0;

        if (!this.options.except) {
            return false;
        }

        for (; l < i; i++) {
            if (exceptions[i] === value) {
                return false;
            }
        }

        return true;
    },

    handleExceptions: function(object) {
        if (this.isException(object.first)) {
            object.first = false;
        }

        if (this.isException(object.last)) {
            object.last = false;
        }

        return object;
    },

    check: function() {
        // We have to jump through the hoops here to find parentheses
        // because for the case call((something)) esprima
        // will remove grouping parentheses
        var callee = this.file.getTokenByRangeStart(this.node.callee.range[0]);
        var parentheses = {
            first: this.file.getNextToken(callee, 'Punctuator', '('),
            last: this.file.getTokenByRangeStart(this.node.range[1] - 1)
        };

        var positions = {
            first: parentheses.first.range[1],
            last:  parentheses.last.range[0] - 1
        };

        var tokens = {
            first: this.file.getTokenByRangeStart(positions.first),
            last: this.file.getTokenByRangeStart(positions.last)
        };

        return this.handleExceptions(tokens);
    }
};

module.exports = function() {};
module.exports.prototype = {
    configure: function(require) {
        var isObject = typeof require === 'object';

        assert(
            require === true || isObject,
            'requireSpacesAroundFunctionArguments option requires boolean true value or object'
       );

        if (typeof require.singleLine === 'object') {
            this._singleLine = require.singleLine;

        } else if (require.singleLine === true) {
            this._singleLine = {};

        } else {
            this._singleLine = null;
        }

        if (typeof require.multiLine === 'object') {
            this._multiLine = require.multiLine;

        } else if (require.multiLine === true) {
            this._multiLine = {};

        } else {
            this._multiLine = null;
        }
    },

    getOptionName: function() {
        return 'requireSpacesAroundFunctionArguments';
    },

    check: function(file, errors) {
        var singleLine = this._singleLine;
        var multiLine = this._multiLine;

        function addError(issues) {
            if (issues.first) {
                errors.add(
                    'Missing space after opening parenthesis', issues.first
                );
            }

            if (issues.last) {
                errors.add(
                    'Missing space before closing parenthesis', issues.last
                );
            }
        }

        file.iterateNodesByType('CallExpression', function(node) {
            var single;
            var multi;

            if (singleLine) {
                single = new Check(node, file, singleLine);

                if (single.isAcceptableSingleLine()) {
                    addError(single.check());
                }
            }

            if (multiLine) {
                multi = new Check(node, file, multiLine);

                if (multi.isAcceptableMultiline()) {
                    addError(multi.check());
                }
            }

            if (!multi && !single) {
                addError(new Check(node, file).check());
            }

        });
    }

};
