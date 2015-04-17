var Checker = require('../../../lib/checker');
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

        it('should not report basic jquery operator with leading underscore and dollar', function() {
            assert(checker.checkString('var _$x = $();').isEmpty());
        });

        it('should not report basic assignment', function() {
            assert(checker.checkString('var x = 2;').isEmpty());
        });

        it('should not report function assignment', function() {
            assert(checker.checkString('var x = function() {};').isEmpty());
        });

        it('should not report function call', function() {
            assert(checker.checkString('var x = fn("foo")').isEmpty());
        });

        it('should not report logical assignment', function() {
            assert(checker.checkString('var a = 1 || 2;').isEmpty());
        });

        it('should report assignment on nextline without semicolon', function() {
            assert(checker.checkString('var a = $(".foo")\nvar b = $()').getErrorCount() === 2);
        });

        it('should not report assignment against dollar prefixed function', function() {
            assert(checker.checkString('var a = $func("foo")').isEmpty());
        });

        it('should not report dollar addition', function() {
            assert(checker.checkString('var a = $ + 2').isEmpty());
        });

        it('should not report binary assignment', function() {
            assert(checker.checkString('var a = 1 + 2;').isEmpty());
        });

        it('should not report for loops', function() {
            assert(checker.checkString('for (var prop in rawVars) {}').isEmpty());
        });

        it('should not report keyed object assignments with string key', function() {
            assert(checker.checkString('obj["foo"] = "bar"').isEmpty());
        });

        it('should not report jquery root functions', function() {
            assert(checker.checkString('var x = $.extends();').isEmpty());
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

        it('should not report chained jquery operator with variable', function() {
            assert(checker.checkString('var x = $(evt.target).val();').isEmpty());
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
            it('should not report basic object creation with string key assignment', function() {
                assert(checker.checkString('!{"a": true}').isEmpty());
            });

            it('should not report object with string key assignment', function() {
                assert(checker.checkString('var a = {"a": true};').isEmpty());
            });

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

            it('should not report direct assignment', function() {
                assert(checker.checkString('this.$video = $video;').isEmpty());
            });

            it('should not report basic assignment', function() {
                assert(checker.checkString('w.x = 2;').isEmpty());
            });

            it('should not report function assignment', function() {
                assert(checker.checkString('w.x = function() {};').isEmpty());
            });

            it('should not report logical assignment', function() {
                assert(checker.checkString('w.a = 1 || 2;').isEmpty());
            });

            it('should not report object logical assignment', function() {
                assert(checker.checkString('w.a = w.a || {};').isEmpty());
            });

            it('should not report binary assignment', function() {
                assert(checker.checkString('w.a = 1 + 2;').isEmpty());
            });

            it('should not report multi level object assignment', function() {
                assert(checker.checkString('a.b.$c = $()').isEmpty());
            });

            it('should report multi level object assignment without dollar', function() {
                assert(checker.checkString('a.b.c = $()').getErrorCount() === 1);
            });
        });
    });

    describe('option value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireDollarBeforejQueryAssignment: 'ignoreProperties' });
        });

        it('should report basic jquery operator', function() {
            assert(checker.checkString('var x = $();').getErrorCount() === 1);
        });

        it('should not report basic jquery operator with dollar', function() {
            assert(checker.checkString('var $x = $();').isEmpty());
        });

        describe('in object definition', function() {
            it('should not report basic jquery operator', function() {
                assert(checker.checkString('var x = { foo: $() }').isEmpty());
            });
        });

        describe('in object properties', function() {
            it('should not report basic jquery operator', function() {
                assert(checker.checkString('this.x = $();').isEmpty());
            });
        });
    });
});
