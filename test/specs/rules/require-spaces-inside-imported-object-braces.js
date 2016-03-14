var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-spaces-inside-imported-object-braces', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('when { requireSpacesInsideImportedObjectBraces: true }', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideImportedObjectBraces: true });
        });

        it('should not report for import without braces', function() {
            expect(checker.checkString('import fooBar from "foo-bar";')).to.have.no.errors();
            expect(checker.checkString('import * as fooBar from "foo-bar";')).to.have.no.errors();
            expect(checker.checkString('import {} from "foo-bar";')).to.have.no.errors();
        });

        it('should report for import without spaces', function() {
            expect(
                checker.checkString('import {foo} from "foo-bar";')
            ).to.have.error.count.equal(2);

            expect(
                checker.checkString('import {foo, bar} from "foo-bar";')
            ).to.have.error.count.equal(2);

            expect(
                checker.checkString('import fooBar, {foo, bar} from "foo-bar";')
            ).to.have.error.count.equal(2);

            expect(
                checker.checkString('import {foo as bar, bar as foo} from "foo-bar";')
            ).to.have.error.count.equal(2);
        });
    });
});
