var chai = require('chai');

chai.use(function(chai, utils) {
    /**
     * Error assertion for `Errors` instances.
     */
    chai.Assertion.addChainableMethod('error', function(message) {
        var list = getErrorList(this);

        if (message) {
            if (utils.flag(this, 'contains')) {
                return this.assert(
                    list.some(function(error) {
                        return error.message === message;
                    }),
                    'Expected to contain "' + message + '"',
                    'Expected not to contain "' + message + '"'
                );
            } else {
                this.assert(
                    list.length === 1,
                    '1 error expected, but ' + list.length + ' found',
                    'Unexpected to have 1 error'
                );
                return this.assert(
                    list[0].message === message,
                    'Expected "' + list[0].message + '" to equal "' + message + '"',
                    'Expected "' + list[0].message + '" not to equal "' + message + '"'
                );
            }
        }
    }, function() {
        if (utils.flag(this, 'one')) {
            var list = getErrorList(this);

            return this.assert(
                list.length === 1,
                'Expected to have 1 error, but ' + list.length + ' found',
                'Expected not to have 1 error'
            );
        }
    });

    /**
     * Rule name assertion for `Errors` instances.
     */
    chai.Assertion.addChainableMethod('from', function(ruleName) {
        var list = getErrorList(this);
        var ruleNames = list.map(function(error) {
            return error.rule;
        });

        var matches = ruleNames.every(function(errorRuleName) {
            return errorRuleName === ruleName;
        });

        return this.assert(
            (utils.flag(this, 'no') ? !matches : matches),
            'Expected error rules "' + ruleNames.join(', ') + '" to equal "' + ruleName + '"',
            'Expected error rules "' + ruleNames.join(', ') + '" not to equal "' + ruleName + '"'
        );
    });

    /**
     * Rule name assertion for `Errors` instances.
     */
    chai.Assertion.addChainableMethod('errors',
        function() {
            var list = getErrorList(this);
            var messages = list.map(function(error) {
                return error.message;
            });
            return this.assert(
                utils.flag(this, 'no') ? list.length === 0 : list.length !== 0,
                'Expected not to have errors, but "' + messages.join(', ') + '" found',
                'Expected to have some errors'
            );
        }
    );

    /**
     * Error count property for `Errors` instances.
     */
    chai.Assertion.addProperty('count', function() {
        return new chai.Assertion(getErrorList(this).length);
    });

    /**
     * Error count property for `Errors` instances.
     */
    chai.Assertion.addProperty('no', function() {
        utils.flag(this, 'no', true);
    });

    /**
     * Error assertion for `Errors` instances.
     */
    chai.Assertion.addProperty('one', function() {
        utils.flag(this, 'one', true);
    });

    chai.Assertion.addProperty('validation', function() {
        utils.flag(this, 'validation', true);
    });

    chai.Assertion.addProperty('parse', function() {
        utils.flag(this, 'parse', true);
    });

    function getErrorList(context) {
        var errors = utils.flag(context, 'object');
        var list = errors.getErrorList();
        if (utils.flag(context, 'validation')) {
            list = list.filter(isValidationError);
        }
        if (utils.flag(context, 'parse')) {
            list = list.filter(isParseError);
        }
        return list;
    }

    function isValidationError(error) {
        return !isParseError(error) && !isInternalError(error);
    }

    function isParseError(error) {
        return error.rule === 'parseError';
    }

    function isInternalError(error) {
        return error.rule === 'internalError';
    }
});
