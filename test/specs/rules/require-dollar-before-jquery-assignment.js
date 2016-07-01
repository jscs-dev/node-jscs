var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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

        it('should not blow up on rest params', function() {
            expect(checker.checkString('var x = {...test}')).to.have.no.errors();
        });

        it('should report basic jquery operator', function() {
            expect(checker.checkString('var x = $();'))
              .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
        });

        it('should not report errors for array case', function() {
            expect(checker.checkString('[a, b, c, d] = foo'))
              .to.have.no.errors();
        });

        it('should not report basic jquery operator with dollar', function() {
            expect(checker.checkString('var $x = $();')).to.have.no.errors();
        });

        it('should not report basic jquery operator with leading underscore and dollar', function() {
            expect(checker.checkString('var _$x = $();')).to.have.no.errors();
        });

        it('should not report basic assignment', function() {
            expect(checker.checkString('var x = 2;')).to.have.no.errors();
        });

        it('should not report for var declaration without assignment', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });

        it('should not report function assignment', function() {
            expect(checker.checkString('var x = function() {};')).to.have.no.errors();
        });

        it('should not report function call', function() {
            expect(checker.checkString('var x = fn("foo")')).to.have.no.errors();
        });

        it('should not report logical assignment', function() {
            expect(checker.checkString('var a = 1 || 2;')).to.have.no.errors();
        });

        it('should report assignment on nextline without semicolon', function() {
            expect(checker.checkString('var a = $(".foo")\nvar b = $()')).to.have.error.count.equal(2);
        });

        it('should not report assignment against dollar prefixed function', function() {
            expect(checker.checkString('var a = $func("foo")')).to.have.no.errors();
        });

        it('should not report dollar addition', function() {
            expect(checker.checkString('var a = $ + 2')).to.have.no.errors();
        });

        it('should not report binary assignment', function() {
            expect(checker.checkString('var a = 1 + 2;')).to.have.no.errors();
        });

        it('should not report for loops', function() {
            expect(checker.checkString('for (var prop in rawVars) {}')).to.have.no.errors();
        });

        it('should not report keyed object assignments with string key', function() {
            expect(checker.checkString('obj["foo"] = "bar"')).to.have.no.errors();
        });

        it('should not report jquery root functions', function() {
            expect(checker.checkString('var x = $.extends();')).to.have.no.errors();
        });

        it('should report jquery operator with html', function() {
            expect(checker.checkString('var x = $("<p>foo</p>");'))
              .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
        });

        it('should not report jquery operator with html with dollar', function() {
            expect(checker.checkString('var $x = $("<p>foo</p>");')).to.have.no.errors();
        });

        it('should report jquery operator with selector', function() {
            expect(checker.checkString('var x = $(".foo");'))
              .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
        });

        it('should not report jquery operator with selector with dollar', function() {
            expect(checker.checkString('var $x = $(".foo");')).to.have.no.errors();
        });

        it('should not report jquery operator using val', function() {
            expect(checker.checkString('var x = $(".foo").val();')).to.have.no.errors();
        });

        it('should not report chained jquery operator with variable', function() {
            expect(checker.checkString('var x = $(evt.target).val();')).to.have.no.errors();
        });

        it('should not report jquery operator using val over multiple lines', function() {
            expect(checker.checkString('var x = $(".foo")\n.val();')).to.have.no.errors();
        });

        it('should not report jquery operator using chained methods', function() {
            expect(checker.checkString('var x = $(".foo").val().toString();')).to.have.no.errors();
        });

        it('should not report jquery operator with dollar and line not beginning with var', function() {
            expect(checker.checkString('$x = $(".foo");')).to.have.no.errors();
        });

        it('should not report jquery operator with dollar and line not ending in semicolon', function() {
            expect(checker.checkString('var $x = $(".foo")')).to.have.no.errors();
        });

        it('should not report jquery operator with dollar and single quotes around selector', function() {
            expect(checker.checkString('var $x = $(\'.foo\');')).to.have.no.errors();
        });

        it('should not report on object destructuring', function() {
            expect(checker.checkString('const {beep, boop} = meep;\nvar $s = $("#id")')).to.have.no.errors();
        });

        it('should not report on array destructuring', function() {
            expect(checker.checkString('const [beep, boop] = meep;\nvar $s = $("#id")')).to.have.no.errors();
        });

        it('should report with assignment on right hand side of object destructuring', function() {
            expect(checker.checkString('var {foo} = {foo: $(".foo")}'))
              .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
        });

        describe('in object definition', function() {
            it('should not report basic object creation with string key assignment', function() {
                expect(checker.checkString('!{"a": true}')).to.have.no.errors();
            });

            it('should not report object with string key assignment', function() {
                expect(checker.checkString('var a = {"a": true};')).to.have.no.errors();
            });

            it('should report basic jquery operator', function() {
                expect(checker.checkString('var x = { foo: $() }'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should not report basic jquery operator with dollar', function() {
                expect(checker.checkString('var x = { $foo: $() }')).to.have.no.errors();
            });

            it('should not report jquery operator with html', function() {
                expect(checker.checkString('var x = { $foo: $("<p>foo</p>") }')).to.have.no.errors();
            });

            it('should not report jquery operator with html with dollar', function() {
                expect(checker.checkString('var $x = { $foo: $("<p>foo</p>") }')).to.have.no.errors();
            });

            it('should report jquery operator with selector', function() {
                expect(checker.checkString('var x = { foo: $(".foo") }'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should not report jquery operator with selector with dollar', function() {
                expect(checker.checkString('var $x = { $foo: $(".foo") }')).to.have.no.errors();
            });

            it('should not report jquery operator using val', function() {
                expect(checker.checkString('var x = { foo: $(".foo").val() }')).to.have.no.errors();
            });

            it('should not report jquery operator using val over multiple lines', function() {
                expect(checker.checkString('var x = { foo: $(".foo")\n.val() }')).to.have.no.errors();
            });

            it('should not report jquery operator using chained methods', function() {
                expect(checker.checkString('var x = { foo: $(".foo").val().toString() }')).to.have.no.errors();
            });

            it('should report jquery operator with dollar and single quotes around selector', function() {
                expect(checker.checkString('var x = { foo: $(\'.foo\') }'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should look at keys besides the first', function() {
                expect(checker.checkString('var x = { bar: 1, foo: $(".foo") }')).to.have.error.count.equal(1);
            });
        });

        describe('in object properties', function() {
            it('should report basic jquery operator', function() {
                expect(checker.checkString('this.x = $();'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should not report basic jquery operator with dollar', function() {
                expect(checker.checkString('this.$x = $();')).to.have.no.errors();
            });

            it('should report jquery operator with html', function() {
                expect(checker.checkString('this.x = $("<p>foo</p>");'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should not report jquery operator with html with dollar', function() {
                expect(checker.checkString('this.$x = $("<p>foo</p>");')).to.have.no.errors();
            });

            it('should report jquery operator with selector', function() {
                expect(checker.checkString('this.x = $(".foo");'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });

            it('should not report jquery operator with selector with dollar', function() {
                expect(checker.checkString('this.$x = $(".foo");')).to.have.no.errors();
            });

            it('should not report jquery operator using val', function() {
                expect(checker.checkString('this.x = $(".foo").val();')).to.have.no.errors();
            });

            it('should not report jquery operator using val over multiple lines', function() {
                expect(checker.checkString('this.x = $(".foo")\n.val();')).to.have.no.errors();
            });

            it('should not report jquery operator using chained methods', function() {
                expect(checker.checkString('this.x = $(".foo").val().toString();')).to.have.no.errors();
            });

            it('should not report jquery operator with dollar and line not ending in semicolon', function() {
                expect(checker.checkString('this.$x = $(".foo")')).to.have.no.errors();
            });

            it('should not report jquery operator with dollar and single quotes around selector', function() {
                expect(checker.checkString('this.$x = $(\'.foo\');')).to.have.no.errors();
            });

            it('should not report direct assignment', function() {
                expect(checker.checkString('this.$video = $video;')).to.have.no.errors();
            });

            it('should not report basic assignment', function() {
                expect(checker.checkString('w.x = 2;')).to.have.no.errors();
            });

            it('should not report function assignment', function() {
                expect(checker.checkString('w.x = function() {};')).to.have.no.errors();
            });

            it('should not report logical assignment', function() {
                expect(checker.checkString('w.a = 1 || 2;')).to.have.no.errors();
            });

            it('should not report object logical assignment', function() {
                expect(checker.checkString('w.a = w.a || {};')).to.have.no.errors();
            });

            it('should not report binary assignment', function() {
                expect(checker.checkString('w.a = 1 + 2;')).to.have.no.errors();
            });

            it('should not report multi level object assignment', function() {
                expect(checker.checkString('a.b.$c = $()')).to.have.no.errors();
            });

            it('should report multi level object assignment without dollar', function() {
                expect(checker.checkString('a.b.c = $()'))
                  .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
            });
        });
    });

    describe('option value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireDollarBeforejQueryAssignment: 'ignoreProperties' });
        });

        it('should report basic jquery operator', function() {
            expect(checker.checkString('var x = $();'))
              .to.have.one.validation.error.from('requireDollarBeforejQueryAssignment');
        });

        it('should not report basic jquery operator with dollar', function() {
            expect(checker.checkString('var $x = $();')).to.have.no.errors();
        });

        describe('in object definition', function() {
            it('should not report basic jquery operator', function() {
                expect(checker.checkString('var x = { foo: $() }')).to.have.no.errors();
            });
        });

        describe('in object properties', function() {
            it('should not report basic jquery operator', function() {
                expect(checker.checkString('this.x = $();')).to.have.no.errors();
            });
        });
    });
});
