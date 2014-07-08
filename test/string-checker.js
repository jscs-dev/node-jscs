var Checker = require('../lib/checker');
var assert = require('assert');

describe('modules/string-checker', function() {
    describe('line starting with hash, temporary, until we will have inline rules', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should ignore lines starting with #!', function() {
            assert(checker.checkString(
                '#! random stuff\n' +
                '#! 1234\n' +
                'var a = 5;\n'
            ).isEmpty());
        });
        it('should ignore ios instruments style import', function() {
            assert(checker.checkString(
                '#import "abc.js"\n' +
                '#import abc.js\n' +
                'var a = 5;\n'
            ).isEmpty());
        });
        it('should not replace when not beginning of line', function() {
            checker.configure({ disallowMultipleLineStrings: true });
            assert(checker.checkString(
                '#import "abc.js"\n' +
                'var b="#import \\\n abc.js";\n' +
                'var a = 5;\n'
            ).getErrorCount() === 1);
        });
    });

    it('should not process the rule if it is equals to null (#203)', function() {
        var checker = new Checker();
        checker.registerDefaultRules();

        try {
            checker.configure({
                preset: 'jquery',
                requireCurlyBraces: null
            });
            assert(true);
        } catch (_) {
            assert(false);
        }
    });
    it('should throw if preset does not exist', function() {
        var checker = new Checker();

        checker.registerDefaultRules();

        try {
            checker.configure({
                preset: 'not-exist'
            });

            assert(false);
        } catch (e) {
            assert(e.toString() === 'Error: Preset "not-exist" does not exist');
        }
    });

    describe('per-file configuration (#487)', function() {
        var checker;
        var defaultConfig = {
            requireTrailingComma: true
        };

        function testSuccess() {
            /* jscs: {"requireTrailingComma": { "ignoreSingleValue": true }} */
            var y = [1];
            function foo () {}
        }

        function testSuccess2() {
            /* jscs: {"requireSpacesInAnonymousFunctionExpression": { "beforeOpeningRoundBrace": true }} */
            var y = [1, 2];
            y.forEach(function () {});
        }

        function testSuccess3() {
            /* jscs: {"requireTrailingComma": { "ignoreSingleValue": true }} */
            /* jscs: {"requireTrailingComma": true } */
            var y = [1];
            function foo () {}
        }

        function testFail() {
            var x = [1];
            function foo () {}
        }

        function testBlank() {
            /* jscs: */
            console.log('foo');
        }

        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure(defaultConfig);
        });

        it('should use configuration at the top of the file, if supplied', function () {
            assert(checker.checkString(testSuccess.toString()).isEmpty());
        });

        it('should only affect the file containing the configuration', function() {
            var errorsSuccess = checker.checkString(testSuccess.toString());
            var errorsFail = checker.checkString(testFail.toString());

            assert(errorsSuccess.isEmpty());
            assert(errorsFail.getErrorCount() === 1);
        });

        it('should not fail if the config has no set properties', function() {
            assert(checker.checkString(testBlank.toString()).isEmpty());
        });

        it('should not use any other rules but the ones supplied in the config', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                requireTrailingComma: true,
                disallowSpacesInFunctionExpression: {
                    beforeOpeningRoundBrace: true,
                    beforeOpeningCurlyBrace: true
                }
            });
            // The config doesn't mention disallowSpacesInFunctionExpression, so it should pass
            // though clearly violating that rule
            assert(checker.checkString(testSuccess.toString()).isEmpty());

            // The config is now reset, so fail should violate the spaces rule
            assert(checker.checkString(testFail.toString()).getErrorCount() === 1);
        });

        it('should not fail for multiple files having a configuration', function() {
            var errorsSuccess = checker.checkString(testSuccess.toString());
            var errorsSuccess2 = checker.checkString(testSuccess2.toString());
            var errorsSuccess3 = checker.checkString(testSuccess3.toString());
            assert(errorsSuccess.isEmpty());
            assert(errorsSuccess2.isEmpty());
            assert(errorsSuccess3.isEmpty());
        });

        it('should restore the configuration after processing each file that has a config', function() {
            function testConfigs() {
                var config = checker.getProcessedConfig();
                assert(Object.keys(config).length === Object.keys(defaultConfig).length);

                Object.keys(config).forEach(function(param) {
                  assert(config[param] === defaultConfig[param]);
                });
            }

            var errorsSuccess = checker.checkString(testSuccess.toString());
            testConfigs();
            var errorsSuccess2 = checker.checkString(testSuccess2.toString());
            testConfigs();
        });

        it('should only use the first configuration in a file', function() {
            var errorsSuccess = checker.checkString(testSuccess.toString());
            assert(errorsSuccess.isEmpty());
        });
    });

    describe('rules registration', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });
        it('should report rules in config which don\'t match any registered rules', function() {
            var error;
            try {
                checker.configure({ disallowMulipleLineBreaks: true, disallowMultipleVarDelc: true });
            } catch (e) {
                error = e;
            }
            assert.equal(
                error.message,
                'Unsupported rules: disallowMulipleLineBreaks, disallowMultipleVarDelc'
            );
        });
        it('should not report rules in config which match registered rules', function() {
            var error;
            try {
                checker.configure({ disallowMultipleLineBreaks: true, disallowMultipleVarDecl: true });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });
        it('should not report "excludeFiles" rule as unregistered', function() {
            var error;
            try {
                checker.configure({ excludeFiles: [] });
            } catch (e) {
                error = e;
            }
            assert(error === undefined);
        });
    });
});
