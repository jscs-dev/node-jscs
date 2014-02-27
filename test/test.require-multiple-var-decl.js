/* jshint -W098 */
/* jshint -W030 */

var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-multiple-var-decl', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireMultipleVarDecl: true });
    });

    it('should report consecutive var decl', function() {
        assert(checker.checkString('var x; var y;').getErrorCount() === 1);
    });
    it('should not report multiple var decl', function() {
        assert(checker.checkString('var x, y;').isEmpty());
    });
    it('should not report separated var decl', function() {
        assert(checker.checkString('var x; x++; var y;').getErrorCount() === 1);
    });
    it('should report multiple vars in function', function() {
        function test() {
            var first = true;

            if ( true ) {
                var second = 2;
            }
        }
        assert(checker.checkString(test.toString()).getErrorCount() === 1);
    });
    it('should not confuse two separate functions', function() {
        function testFunc() {
            function foo() {
                var first = true;
                if ( true ) {
                    var second = 2;
                }
            }

            function bar() {
                var third = true;
            }
        }

        assert(checker.checkString(testFunc.toString()).getErrorCount() === 1);
    });
    it('should not report multiple vars in nested functions', function() {
        function testFunc() {
            function foo() {
                var first = true;

                function bar() {
                    var second = true;
                }
            }
        }

        assert(checker.checkString(testFunc.toString()).isEmpty());
    });
    it('should report multiple vars in nested functions', function() {
        function testFunc() {
            function foo() {
                var first = true;

                function bar() {
                    var second = true;

                    if (true) {
                        var third = true;
                    }
                }
            }
        }

        assert(checker.checkString(testFunc.toString()).getErrorCount() === 1);
    });
    it('should report multiple vars for complicated example of nested functions', function() {
        function testFunc() {
            function foo() {
                var first = true;

                function bar() {
                    var second = true;

                    if (true) {
                        var third = true;

                        while (true) {
                            var fourth = true;

                            for (;;) {
                                var fifth = true;
                            }
                        }
                    }
                }
            }
        }

        assert(checker.checkString(testFunc.toString()).getErrorCount() === 3);
    });
    it('should report multiple vars for function expression', function() {
        var testFunc = '!function() { var first = true; if ( true ) { var second = true; }};';

        assert(checker.checkString(testFunc).getErrorCount() === 1);
    });
    it('should report multiple vars for nested functions declarations and expressions', function() {
        function testFunc() {
            function foo() {
                var first = true;

                function bar() {
                    var second = true;

                    if (true) {
                        var third = true;

                        !function() {
                            while (true) {
                                var fourth = true;

                                for (;;) {
                                    var fifth = true;
                                }
                            }
                        };
                    }
                }
            }
        }

        assert(checker.checkString(testFunc.toString()).getErrorCount() === 2);
    });
    it('should report multiple vars even if function in the way', function() {
        function testFunc() {
            var first = true;
            function foo() {
                var second = true;
            }
            var third = true;
        }

        assert(checker.checkString(testFunc.toString()).getErrorCount() === 1);
    });
});
