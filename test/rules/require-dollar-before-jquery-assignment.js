var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-dollar-before-jquery-assignment', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value `true`', function() {
        beforeEach(function() {
            checker.configure({ requireDollarBeforejQueryAssignment: true });
        });

        it('should report basic jquery operator', function() {
            assert(checker.checkString('var x = $();').getErrorCount() === 1);
        });

        it('should not report basic jquery operator with dollar', function() {
            assert(checker.checkString('var $x = $();').isEmpty());
        });

        it('should report jquery operator with html', function() {
            assert(checker.checkString('var x = $("<p>foo</p>");').getErrorCount() === 1);
        });

        it('should not report jquery operator with html with dollar', function() {
            assert(checker.checkString('var $x = $("<p>foo</p>");').isEmpty());
        });

        it('should report jquery operator with selector', function() {
            assert(checker.checkString('var x = $(".foo");').getErrorCount() === 1);
        });

        it('should not report jquery operator with selector with dollar', function() {
            assert(checker.checkString('var $x = $(".foo");').isEmpty());
        });

        it('should not report jquery operator using val', function() {
            assert(checker.checkString('var x = $(".foo").val();').isEmpty());
        });

        it('should not report jquery operator using val over multiple lines', function() {
            assert(checker.checkString('var x = $(".foo")\n.val();').isEmpty());
        });

        it('should not report jquery operator using chained methods', function() {
            assert(checker.checkString('var x = $(".foo").val().toString();').isEmpty());
        });

        it('should not report jquery operator with dollar and line not beginning with var', function() {
            assert(checker.checkString('$x = $(".foo");').isEmpty());
        });

        it('should not report jquery operator with dollar and line not ending in semicolon', function() {
            assert(checker.checkString('var $x = $(".foo")').isEmpty());
        });

        it('should not report jquery operator with dollar and single quotes around selector', function() {
            assert(checker.checkString('var $x = $(\'.foo\');').isEmpty());
        });

        describe('in object definition', function() {
            it('should report basic jquery operator', function() {
                assert(checker.checkString('var x = { foo: $() }').getErrorCount() === 1);
            });

            it('should not report basic jquery operator with dollar', function() {
                assert(checker.checkString('var x = { $foo: $() }').isEmpty());
            });

            it('should not report jquery operator with html', function() {
                assert(checker.checkString('var x = { $foo: $("<p>foo</p>") }').isEmpty());
            });

            it('should not report jquery operator with html with dollar', function() {
                assert(checker.checkString('var $x = { $foo: $("<p>foo</p>") }').isEmpty());
            });

            it('should report jquery operator with selector', function() {
                assert(checker.checkString('var x = { foo: $(".foo") }').getErrorCount() === 1);
            });

            it('should not report jquery operator with selector with dollar', function() {
                assert(checker.checkString('var $x = { $foo: $(".foo") }').isEmpty());
            });

            it('should not report jquery operator using val', function() {
                assert(checker.checkString('var x = { foo: $(".foo").val() }').isEmpty());
            });

            it('should not report jquery operator using val over multiple lines', function() {
                assert(checker.checkString('var x = { foo: $(".foo")\n.val() }').isEmpty());
            });

            it('should not report jquery operator using chained methods', function() {
                assert(checker.checkString('var x = { foo: $(".foo").val().toString() }').isEmpty());
            });

            it('should report jquery operator with dollar and single quotes around selector', function() {
                assert(checker.checkString('var x = { foo: $(\'.foo\') }').getErrorCount() === 1);
            });
        });

        describe('in object properties', function() {
            it('should report basic jquery operator', function() {
                assert(checker.checkString('this.x = $();').getErrorCount() === 1);
            });

            it('should not report basic jquery operator with dollar', function() {
                assert(checker.checkString('this.$x = $();').isEmpty());
            });

            it('should report jquery operator with html', function() {
                assert(checker.checkString('this.x = $("<p>foo</p>");').getErrorCount() === 1);
            });

            it('should not report jquery operator with html with dollar', function() {
                assert(checker.checkString('this.$x = $("<p>foo</p>");').isEmpty());
            });

            it('should report jquery operator with selector', function() {
                assert(checker.checkString('this.x = $(".foo");').getErrorCount() === 1);
            });

            it('should not report jquery operator with selector with dollar', function() {
                assert(checker.checkString('this.$x = $(".foo");').isEmpty());
            });

            it('should not report jquery operator using val', function() {
                assert(checker.checkString('this.x = $(".foo").val();').isEmpty());
            });

            it('should not report jquery operator using val over multiple lines', function() {
                assert(checker.checkString('this.x = $(".foo")\n.val();').isEmpty());
            });

            it('should not report jquery operator using chained methods', function() {
                assert(checker.checkString('this.x = $(".foo").val().toString();').isEmpty());
            });

            it('should not report jquery operator with dollar and line not ending in semicolon', function() {
                assert(checker.checkString('this.$x = $(".foo")').isEmpty());
            });

            it('should not report jquery operator with dollar and single quotes around selector', function() {
                assert(checker.checkString('this.$x = $(\'.foo\');').isEmpty());
            });
        });
    });
});
