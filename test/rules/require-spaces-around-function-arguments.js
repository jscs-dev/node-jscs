var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-around-function-arguments', function() {
    var checker;

    describe('true value', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ requireSpacesAroundFunctionArguments: true });
        });
        it('should not report errors for arguments with spaces', function() {
            assert(checker.checkString('call( 1, 2 )').isEmpty());
        });

        it('should report error for left argument', function() {
            assert(checker.checkString('call(1, 2 )').getErrorCount() === 1);
        });

        it('should report error for right argument', function() {
            assert(checker.checkString('call( 1, 2)').getErrorCount());
        });

        it('should report for both argument', function() {
            assert(checker.checkString('call(1, 2)').getErrorCount() === 2);
        });

        it('should report for both argument with more then 2 arguments', function() {
            assert(checker.checkString('call(1, 2)').getErrorCount() === 2);
            assert(checker.checkString('call(1, 2, 3)').getErrorCount() === 2);
            assert(checker.checkString('call(1, 2, 3, 4)').getErrorCount() === 2);
        });
    });

    describe('object value', function() {
        describe('singleline', function() {
            beforeEach(function() {
                checker = new Checker();
                checker.registerDefaultRules();
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: {
                            arity: '1',
                            except: ['{', '}', '[', ']', 'function']
                        }
                    }
                });
            });

            it('should not report error for exceptions with one argument', function() {
                assert(checker.checkString('call({ test: "test" })').isEmpty());
            });

            it('should report error for exceptions with two arguments', function() {
                assert(checker.checkString('call({ test: "test" }, { test: "test" })').isEmpty());
            });

            it('should not report error for exceptions with three arguments', function() {
                assert(checker.checkString('call({ test: "test" }, 2, { test: "test" })').isEmpty());
            });

            it('should not report error for multiline object argument', function() {
                assert(checker.checkString('call({ test: \n "test" })').isEmpty());
            });
        });

        describe('singleline with different arity value', function() {
            beforeEach(function() {
                checker = new Checker();
                checker.registerDefaultRules();
            });

            it('should not report error for exceptions with one argument', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: {
                            arity: '1'
                        }
                    }
                });

                assert(checker.checkString('call({ test: "test" })').getErrorCount() === 2);
            });

            it('should report error for exceptions with two arguments', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: {
                            arity: '>1'
                        }
                    }
                });

                assert(checker.checkString('call({ test: "test" }, { test: "test" })').getErrorCount() === 2);
            });

            it('should report error for exceptions with two arguments in parentheses', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: {
                            arity: '1'
                        }
                    }
                });

                assert(checker.checkString('call(("test"))').getErrorCount() === 2);
            });

            it('should report error for exceptions with three arguments', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: {
                            arity: '<3'
                        }
                    }
                });

                assert(checker.checkString('call({ test: "test" }, 2, { test: "test" })').isEmpty());
            });

            it('should report error with true value', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: true
                    }
                });

                assert(checker.checkString('call({ test: "test" })').getErrorCount() === 2);
            });

            it('should not report error with multiline object argument', function() {
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        singleLine: true
                    }
                });

                assert(checker.checkString('call({ test: \n "test" })').isEmpty());
            });
        });

        describe('multiline', function() {
            beforeEach(function() {
                checker = new Checker();
                checker.registerDefaultRules();
                checker.configure({
                    requireSpacesAroundFunctionArguments: {
                        multiLine: true
                    }
                });
            });

            it('should not report error for exceptions with one argument', function() {
                assert(checker.checkString('call({ test: "test" })').isEmpty());
            });

            it('should  asd report error with multiline object argument', function() {
                assert(checker.checkString('call({ test: \n "test" })').getErrorCount() === 2);
            });
        });
    });
});
