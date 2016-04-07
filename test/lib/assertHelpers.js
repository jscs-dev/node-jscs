var expect = require('chai').expect;
var Checker = require('../../lib/checker');

var AssertHelpers = {

    /**
     * Assert that the input fails with a certain number of errors and when fixed matches output with no errors.
     *
     * @param {Object} options
     * @param {String} options.name the name of the test that will be put in the describe block
     * @param {Object} options.rules the object that will be passed to checker.configure
     * @param {String} options.input the input string to check
     * @param {String} options.output the output string that input should match after being fixed
     * @param {Number} [options.errors='1'] the expected number of errors when checking input
     */
    reportAndFix: function(options) {
        if (!options.name) {
            options.name = options.input;
        }

        expect(options).to.be.a('object');
        expect(options.name).to.be.a('string');
        expect(options.rules).to.be.a('object');
        expect(options.input).to.be.a('string');
        expect(options.output).to.be.a('string');

        if (options.errors !== undefined) {
            expect(options.errors).to.be.a('number');
        }

        options.errors = options.errors === undefined ? 1 : options.errors;

        function check() {
            var checker;

            beforeEach(function() {
                checker = new Checker();
                checker.registerDefaultRules();
                checker.configure(options.rules);
            });

            it('report', function() {
                expect(checker.checkString(options.input)).to.have.error.count.equal(options.errors);
            });

            it('fix', function() {
                var result = checker.fixString(options.input);
                expect(result.errors).to.have.no.errors();
                expect(highlightws(result.output)).to.equal(highlightws(options.output));
            });
        }

        if (options.only) {
            describe.only(options.name, check);

        } else if (options.skip) {
            describe.skip(options.name, check);

        } else {
            describe(options.name, check);
        }

        function highlightws(str) {
            return str.replace(/\t/g, '\\t')
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')
                .replace(/\s/g, '\\s');
        }
    }
};

module.exports = AssertHelpers;
