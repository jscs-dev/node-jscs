/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

// Expose internal grunt libs.
function gRequire(name) {
  return grunt[name] = require('./grunt/' + name);
}

var option = gRequire('option');
var help = gRequire('help');

// Expose the task interface. I've never called this manually, and have no idea
// how it will work. But it might.
grunt.tasks = function(tasks, options, done) {

  // Display the grunt version and quit if the user did --version.
  var _tasks, _options;
  if (option('version')) {

    if (option('verbose')) {
      // Initialize task system so that available tasks can be listed.
      grunt.task.init([], {help: true});

      Object.keys(grunt.cli.optlist).forEach(function(long) {
        var o = grunt.cli.optlist[long];
        _options.push('--' + (o.negate ? 'no-' : '') + long);
        if (o.short) { _options.push('-' + o.short); }
      });
    }
  }

  // Determine and output which tasks will be run.
  var tasksSpecified = tasks && tasks.length > 0;
  tasks = task.parseArgs([tasksSpecified ? tasks : 'default']);

  if (!tasksSpecified) {
    verbose.writeln('No tasks specified, running default tasks.');
  }

  // Report, etc when all tasks have completed.
  task.options({
    done: function() {
      process.removeListener('uncaughtException', uncaughtHandler);
      fail.report();

      if (done) {
        done();
      } else {
        util.exit(0);
      }
    }
  });
};
