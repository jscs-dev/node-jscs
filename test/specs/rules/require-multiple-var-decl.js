/* jshint -W098 */
/* jshint -W030 */

var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-multiple-var-decl', function() {
    var checker;

    describe.skip('boolean', function() {
        var checker;
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ requireMultipleVarDecl: true });
        });
        it('should not report const and var decls as one entity (#462)', function() {
            expect(checker.checkString('const a = 1; var b = 2;')).to.have.no.errors();
        });
        it('should report consecutive var decl', function() {
            expect(checker.checkString('var x; var y;'))
            .to.have.one.error.from('ruleName');
        });
        it('should not report multiple var decl', function() {
            expect(checker.checkString('var x, y;')).to.have.no.errors();
        });
        it('should not report separated var decl', function() {
            expect(checker.checkString('var x; x++; var y;')).to.have.no.errors();
        });
        it('supports var decl not contained by a parent with a `body` property (#916, #1163)', function() {
            expect(checker.checkString('switch (1) { case 1: var x; }')).to.have.no.errors();
        });
        it('should report consecutive var decl not contained by a parent with a `body` property', function() {
            expect(checker.checkString('switch (1) { case 1: var x; var y; }'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('onevar', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ requireMultipleVarDecl: 'onevar' });
        });

        it('should not report const and var decls as one entity (#462)', function() {
            expect(checker.checkString('const a = 1; var b = 2;')).to.have.no.errors();
        });
        it('should report consecutive var decl', function() {
            expect(checker.checkString('var x; var y;'))
            .to.have.one.error.from('ruleName');
        });
        it('should not report multiple var decl', function() {
            expect(checker.checkString('var x, y;')).to.have.no.errors();
        });
        it('should report separated var decl', function() {
            expect(checker.checkString('var x; x++; var y;'))
            .to.have.one.error.from('ruleName');
        });
        it('should report multiple vars in function', function() {
            function test() {
                var first = true;

                if (true) {
                    var second = 2;
                }
            }
            expect(checker.checkString(test.toString()))
            .to.have.one.error.from('ruleName');
        });
        it('should report multiple const in function', function() {
            /* jshint esnext: true */
            function test() {
                const first = true;

                if (true) {
                    const second = 2;
                }
            }
            expect(checker.checkString(test.toString()))
            .to.have.one.error.from('ruleName');
        });
        it('should report multiple const and vars in function', function() {
            /* jshint esnext: true */
            function test() {
                const firstConst = true;
                var firstVar = true;

                if (true) {
                    const secondConst = 2;
                    var secondVar = 2;
                }
            }
            assert(checker.checkString(test.toString()).getValidationErrorCount() === 2);
        });
        it('should not confuse two separate functions', function() {
            function testFunc() {
                function foo() {
                    var first = true;
                    if (true) {
                        var second = 2;
                    }
                }

                function bar() {
                    var third = true;
                }
            }

            expect(checker.checkString(testFunc.toString()))
            .to.have.one.error.from('ruleName');
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

            expect(checker.checkString(testFunc.toString())).to.have.no.errors();
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

            expect(checker.checkString(testFunc.toString()))
            .to.have.one.error.from('ruleName');
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

            assert(checker.checkString(testFunc.toString()).getValidationErrorCount() === 3);
        });
        it('should report multiple vars for function expression', function() {
            var testFunc = '!function() { var first = true; if (true) { var second = true; }};';

            expect(checker.checkString(testFunc))
            .to.have.one.error.from('ruleName');
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

            assert(checker.checkString(testFunc.toString()).getValidationErrorCount() === 2);
        });
        it('should report multiple vars even if function in the way', function() {
            function testFunc() {
                var first = true;
                function foo() {
                    var second = true;
                }
                var third = true;
            }

            expect(checker.checkString(testFunc.toString()))
            .to.have.one.error.from('ruleName');
        });
    });
});
