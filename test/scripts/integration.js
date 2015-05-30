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

    (function test(messages, args) {

        // Execute jscs -x on jscs source code for the given presets
        var child = spawn('node', args, { timeout: Infinity });

        process.stdout.write(messages.start + '\n\n');
        process.stdout.write(chalk.magenta(' - ') + messages.fixStart + '\n');

        child.stderr.setEncoding('utf8');

        // For some reason this makes subprocess to be more effective
        child.stdout.on('data', function() {});

        child.stderr.on('data', function(data) {
            process.stderr.write(chalk.red(' ! ') + 'Error:\n');
            process.stderr.write(data);
        });

        // Wait until autofix process is done
        child.on('close', function executeTests(code) {

            // exit code == 2 means there is some unfixable style violations
            if (code !== 0 && code !== 2) {
                process.stderr.write(chalk.red(' ! ') + messages.fixError + '\n\n');
                process.exit(code);

                return;
            }

            // Execute jscs tests on modified source code
            var sChild = spawn('mocha', ['--color']);
            var counter = 1;

            process.stdout.write(chalk.magenta(' - ') + messages.unitStart + '\n');

            // Show output, basically show that something is going on
            sChild.stdout.on('data', function log() {

                // Do not be so verbose
                if (counter % 5 === 0) {
                    process.stdout.write(chalk.grey('.'));
                }

                if (counter % 400 === 0) {
                    process.stdout.write('\n');
                }

                counter++;
            });

            // Wait until tests are finished
            sChild.on('close', function(code) {

                // exit code == 2 means there is pending tests
                if (code !== 0 && code !== 2) {
                    process.stderr.write('\n\n' + chalk.red(' ! ') + messages.unitError + '\n\n');
                    process.exit(code);

                // Show "OK" message and execute next presets
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

// Listen for all "exit" events so we could put everything back
process.on('exit', exit);
process.on('SIGINT', exit);
process.on('uncaughtException', exit);

// Run autofix process on all available presets
execPresets(presets);
