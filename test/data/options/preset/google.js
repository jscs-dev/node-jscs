// includes portions of yo cli (c) Google
var fs = require('fs');
var path = require('path');
var nopt = require('nopt');
var chalk = require('chalk');
var pkg = require('./package.json');
var _ = require('lodash');
var updateNotifier = require('update-notifier');
var sudoBlock = require('sudo-block');
var isRoot = require('is-root');
var Insight = require('insight');
var yosay = require('yosay');
var stringLength = require('string-length');

var opts = nopt({
  help: Boolean,
  version: Boolean
}, {
  h: '--help',
  v: '--version'
});

var args = opts.argv.remain;
var cmd = args[0];

var insight = new Insight({
  trackingCode: 'UA-31537568-1',
  packageName: pkg.name,
  packageVersion: pkg.version
});

if (opts.insight === false) {
  insight.config.set('optOut', true);
} else if (opts.insight) {
  insight.config.set('optOut', false);
}

function rootCheck() {
  if (isRoot() && process.setuid) {
    try {
      // Try to force yo to run on a safe uid
      process.setuid(501);
    } catch (err) {}
  }

  sudoBlock();
}

function init() {
  var env = require('yeoman-generator')();
  var meta;

  // alias any single namespace to `*:all` and `webapp` namespace specifically
  // to webapp:app.
  env.alias(/^([^:]+)$/, '$1:all');
  env.alias(/^([^:]+)$/, '$1:app');

  // lookup for every namespaces, within the environments.paths and lookups
  env.lookup();

  // list generators
  if (opts.generators) {
    meta = _.uniq(Object.keys(env.getGeneratorsMeta()).map(function (el) {
      return el.split(':')[0];
    })).join('\n');
    return console.log(meta);
  }

  env.on('end', function () {
    console.log('Done running sir');
  });

  env.on('error', function (err) {
    console.error('Error', process.argv.slice(2).join(' '), '\n');
    console.error(opts.debug ? err.stack : err.message);
    process.exit(err.code || 1);
  });

  // Register the `yo yo` generator.
  if (!cmd) {
    if (opts.help) {
      return console.log(env.help('yo'));
    }

    env.register(path.resolve(__dirname, './yoyo'), 'yo');
    args = ['yo'];
    // make the insight instance available in `yoyo`
    opts = { insight: insight };
  }

  // Note: at some point, nopt needs to know about the generator options, the
  // one that will be triggered by the below args. Maybe the nopt parsing
  // should be done internally, from the args.
  env.run(args, opts);
}

function pre() {
  if (opts.version) {
    return console.log(pkg.version);
  }

  // Debugging helper
  if (cmd === 'doctor') {
    return require('./scripts/doctor');
  }

  // easteregg
  if (cmd === 'yeoman' || cmd === 'yo') {
    return fs.createReadStream(__dirname + '/yeoman.txt').pipe(process.stdout);
  }

  init();
}

if (!process.env.yeomanTest && opts.insight !== false) {
  if (insight.optOut === undefined) {
    insight.optOut = insight.config.get('optOut');
    insight.track('downloaded');
    insight.askPermission(insightMsg, pre);
  }
  // only track the two first subcommands
  insight.track.apply(insight, args.slice(0, 2));
}

if (!process.env.yeomanTest && opts['update-notifier'] !== false) {
  var notifier = updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
  });

  var message = [];

  if (notifier.update) {
    message.push('Update available: ' +
      chalk.green.bold(notifier.update.latest) +
      chalk.gray(' (current: ' + notifier.update.current + ')')
    );
    message.push('Run ' +
      chalk.magenta('npm update -g ' + pkg.name) +
      ' to update.'
    );
    console.log(yosay(message.join(' '), {
      maxLength: stringLength(message[0])
    }));
  }
}

rootCheck();
pre();
