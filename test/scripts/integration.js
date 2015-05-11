var fs = require('fs');
var spawn = require('child_process').spawn;

var chalk = require('chalk');
var presets = fs.readdirSync('./presets').map(function(preset) {
    return preset.replace('.json', '');
});

function exit() {
    spawn('git', ('checkout lib test/specs').split(' '));
}

function execPresets(presets) {
    var preset = presets.pop();

    if (!preset) {
        exit();
        console.log(
            chalk.green('> ') + 'Autofix ingeration tests are ' + chalk.green('finished'),
            '\n'
        );

        return;
    }

    var args = ('./bin/jscs lib test/specs -x -p ' + preset).split(' ');
    var messages = {
        start: 'Preset "' + chalk.green(preset) + '"',

        fixStart: 'Autofix execution',
        fixError: 'Autofix failure',

        unitStart: 'Unit tests',
        unitEnd: 'Unit test on "' + chalk.green(preset) + '" preset are finished',
        unitError: 'Unit tests failure'
    };

    (function(messages, args) {
        var child = spawn('node', args, { timeout: Infinity });

        process.stdout.write(messages.start + '\n\n');
        process.stdout.write(chalk.magenta(' - ') + messages.fixStart + '\n');

        child.stdout.on('data', function() {});

        child.on('close', function(code) {
            // exit code == 2 means there is some unfixable style violations
            if (code !== 0 && code !== 2) {
                process.stderr.write(chalk.red(' ! ') + messages.fixError + '\n\n');
                process.exit(code);

                return;
            }

            var sChild = spawn('mocha', ['--color']);
            var counter = 1;

            process.stdout.write(chalk.magenta(' - ') + messages.unitStart + '\n');

            sChild.stdout.on('data', function() {

                // Do not be so verbose
                if (counter % 5 === 0) {
                    process.stdout.write(chalk.grey('.'));
                }

                if (counter % 400 === 0) {
                    process.stdout.write('\n');
                }

                counter++;
            });

            sChild.on('close', function(code) {
                // exit code == 2 means there is pending tests
                if (code !== 0 && code !== 2) {
                    process.stderr.write('\n\n' + chalk.red(' ! ') + messages.unitError + '\n\n');
                    process.exit(code);

                } else {
                    process.stdout.write('\n\n' + chalk.magenta(' - ') + messages.unitEnd);
                    process.stdout.write('\n' + chalk.black(new Array(80).join('-')) + '\n\n');
                    execPresets(presets);
                }
            });

        });
    })(messages, args);
}

console.log('\n' + chalk.green('> ') + 'Autofix ingeration tests', '\n');

process.on('exit', exit);
process.on('SIGINT', exit);
process.on('uncaughtException', exit);

execPresets(presets);
