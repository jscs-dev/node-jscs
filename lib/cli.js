var fs = require('fs');
var program = require('commander');
var Vow = require('vow');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'configuration file path')
    .parse(process.argv);

var Checker = require('./checker');
var checker = new Checker();

var configPath = program.config || (process.cwd() + '/.jscs.json');

if (fs.existsSync(configPath)) {
    checker.registerDefaultRules();
    checker.configure(require(configPath));
    Vow.all(program.args.map(function(path) {
        return checker.checkPath(path);
    })).then(function (results) {
        var errorsCollection = [].concat.apply([], results);
            var errorCount = 0;
            errorsCollection.forEach(function (errors) {
                if (!errors.isEmpty()) {
                    errors.getErrorList().forEach(function(error) {
                        errorCount++;
                        console.log(
                            errors.explainError(error, true) + '\n'
                        );
                    });
                }
            });
            if (errorCount) {
                console.log('\n' + errorCount + ' code style errors found.');
                process.exit(1);
            } else {
                console.log('No code style errors found.');
            }
        }).fail(function(e) {
            console.log(e.stack);
            process.exit(1);
        });
} else {
    console.log('Configuration file ' + configPath + ' was not found.');
    process.exit(1);
}

