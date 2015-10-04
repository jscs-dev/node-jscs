var expect = require('chai').expect;
var sinon = require('sinon');
var path = require('path');
var fs = require('fs');
var Vow = require('vow');

var Checker = require('../../../lib/checker');
var Configuration = require('../../../lib/config/configuration');
var ConfigGenerator = require('../../../lib/config/generator');
var crockfordClone = require('../../data/configs/generator/crockfordClone');

describe('lib/config/generator', function() {
    var _path = path.resolve(__dirname, '../../../lib/config/generator.js');
    var crockfordPresetChoice;

    // jscs:disable maximumLineLength
    var crockfordViolationsAllExceptions = {
        '\u001b[32mrequireMultipleVarDecl\u001b[39m (18 violations in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e',
        '\u001b[32mdisallowDanglingUnderscores\u001b[39m (25 violations in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e',
        '\u001b[32mrequireSpaceAfterKeywords\u001b[39m (17 violations in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e',
        '\u001b[32mrequireBlocksOnNewline\u001b[39m (2 violations in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e',
        '\u001b[32mdisallowSpaceBeforeBinaryOperators\u001b[39m (1 violation in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e',
        '\u001b[32mrequireSpacesInAnonymousFunctionExpression\u001b[39m (17 violations in 1 file):\n    Create an (e)xception for this rule, or (f)ix the errors yourself?': 'e'
    };
    // jscs:enable maximumLineLength

    var expectedConfig = {
        preset: 'crockfordClone',
        requireMultipleVarDecl: null,
        disallowDanglingUnderscores: null,
        requireSpaceAfterKeywords: null,
        requireBlocksOnNewline: null,
        disallowSpaceBeforeBinaryOperators: null
    };

    var generator;
    var oldRegisterPreset;

    beforeEach(function() {
        sinon.stub(console, 'log');
        generator = new ConfigGenerator();

        // Allows the generator's internal checker to see the cloned preset
        oldRegisterPreset = Configuration.prototype.registerDefaultPresets;
        Configuration.prototype.registerDefaultPresets = function() {
            oldRegisterPreset.call(this);
            this.registerPreset('crockfordClone', crockfordClone);
        };
    });

    afterEach(function() {
        rAfter();
        Configuration.prototype.registerDefaultPresets = oldRegisterPreset;
    });

    function rAfter() {
        if (console.log.restore) {
            console.log.restore();
        }
    }

    function getChecker() {
        var checker = new Checker();
        checker.registerDefaultRules();

        var lastPresetOrdinal = Object.keys(checker.getConfiguration().getRegisteredPresets()).length;
        crockfordPresetChoice = { '\u001b[32mPlease choose a preset number:\u001b[39m':  lastPresetOrdinal };

        return checker;
    }

    it('checks a given path against all registered presets', function() {
        var checkPathStub = sinon.stub(Checker.prototype, 'checkPath');
        // For preventing subsequent steps from running
        var showErrorCountsStub = sinon.stub(generator, '_showErrorCounts').throws();

        var checker = getChecker();

        var numPresets = Object.keys(checker.getConfiguration().getRegisteredPresets()).length;

        generator.generate(_path);
        expect(checkPathStub).to.have.callCount(numPresets);

        checkPathStub.restore();
        showErrorCountsStub.restore();
    });

    it('displays a count of errors for every preset', function(done) {
        var stub = sinon.stub(generator, '_getUserPresetChoice').throws();
        var presetNames = Object.keys(getChecker().getConfiguration().getRegisteredPresets());
        generator.generate(_path)
        .then(null, function() {
            var output = console.log.getCall(1).args[0];

            presetNames.forEach(function(name) {
                expect(output.indexOf(name)).to.not.equal(-1);
            });

            stub.restore();
            done();
        });
    });

    it('prompts the user to choose a preset', function(done) {
        var stub = sinon.stub(generator, '_showPrompt').throws();
        generator.generate(_path).then(null, function() {
            var prompt = stub.getCall(0).args[0].name;
            expect(prompt.indexOf('Please choose a preset number:')).to.not.equal(-1);

            stub.restore();
            done();
        });
    });

    it('prompts the user to create an exception or fix a given rule', function(done) {
        var stub = sinon.stub(generator, '_getUserPresetChoice').returns(crockfordPresetChoice);
        var getViolationsStub = sinon.stub(generator, '_showPrompt').throws();

        generator.generate(_path).then(null, function() {
            var errorPrompts = getViolationsStub.getCall(0).args[0];
            expect(errorPrompts.length).to.be.at.least(1);
            errorPrompts.forEach(function(prompt) {
                expect(prompt.name.indexOf('(e)xception')).to.not.equal(-1);
                expect(prompt.name.indexOf('(f)ix')).to.not.equal(-1);
            });
            stub.restore();
            getViolationsStub.restore();
            done();
        });
    });

    it.skip('generates a .jscsrc file with the user\'s violation choices', function() {
        var presetChoiceStub = sinon.stub(generator, '_getUserPresetChoice').returns(crockfordPresetChoice);
        var getViolationsStub = sinon.stub(generator, '_getUserViolationChoices')
                                .returns(Vow.cast(crockfordViolationsAllExceptions));
        var fsStub = sinon.stub(fs, 'writeFileSync');

        var assertConfigEquality = function(c1, c2) {
            for (var prop in c1) {
                expect(c1[prop]).to.equal(c2[prop]);
            }
        };

        return generator.generate(_path).then(function() {
            var configPath = fsStub.getCall(0).args[0];
            var config = JSON.parse(fsStub.getCall(0).args[1]);
            expect(configPath).to.equal(process.cwd() + '/.jscsrc');
            assertConfigEquality(expectedConfig, config);
            presetChoiceStub.restore();
            getViolationsStub.restore();
            fsStub.restore();
        });
    });
});
