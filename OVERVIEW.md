<!-- toc -->

## Presets

 * [Airbnb](https://github.com/jscs-dev/node-jscs/blob/master/presets/airbnb.json) — https://github.com/airbnb/javascript
 * [Crockford](https://github.com/jscs-dev/node-jscs/blob/master/presets/crockford.json) — http://javascript.crockford.com/code.html
 * [Google](https://github.com/jscs-dev/node-jscs/blob/master/presets/google.json) — https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * [Grunt](https://github.com/jscs-dev/node-jscs/blob/master/presets/grunt.json) — http://gruntjs.com/contributing#syntax
 * [jQuery](https://github.com/jscs-dev/node-jscs/blob/master/presets/jquery.json) — https://contribute.jquery.org/style-guide/js/
 * [MDCS](https://github.com/jscs-dev/node-jscs/blob/master/presets/mdcs.json) — [https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style™](https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2)
 * [Wikimedia](https://github.com/jscs-dev/node-jscs/blob/master/presets/wikimedia.json) — https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
 * [Yandex](https://github.com/jscs-dev/node-jscs/blob/master/presets/yandex.json) — https://github.com/yandex/codestyle/blob/master/javascript.md
 * [JSCS](https://github.com/jscs-dev/node-jscs/blob/master/presets/jscs.json)

## Friendly packages

 * Atom plugin: https://atom.io/packages/linter-jscs
 * Brackets Extension: https://github.com/globexdesigns/brackets-jscs
 * Grunt task: https://github.com/jscs-dev/grunt-jscs/
 * Gulp task: https://github.com/jscs-dev/gulp-jscs/
 * SublimeText 3 Plugin: https://github.com/SublimeLinter/SublimeLinter-jscs/
 * Syntastic VIM Plugin: [https://github.com/scrooloose/syntastic/.../syntax_checkers/javascript/jscs.vim/](https://github.com/scrooloose/syntastic/blob/master/syntax_checkers/javascript/jscs.vim/)
 * Web Essentials for Visual Studio 2013: https://github.com/madskristensen/WebEssentials2013/
 * IntelliJ IDEA, RubyMine, WebStorm, PhpStorm, PyCharm plugin: https://github.com/idok/jscs-plugin

### Extensions

 * A TeamCity reporter: https://github.com/wurmr/jscs-teamcity-reporter
 * JSDoc rules extension: https://github.com/jscs-dev/jscs-jsdoc

## Installation

`jscs` can be installed using `npm`:

```
npm install jscs -g
```

To run `jscs`, you can use the following command from the project root:

```
jscs path[ path[...]]
```

You can also pipe input into jscs:

```
cat myfile.js | jscs
```

## CLI

### `--auto-configure` (Experimental)
Presents a walkthrough that allows you to generate a JSCS configuration by
choosing a preset and handling violated rules.

```
jscs --auto-configure path
```

`path` can be a file or directory to check the presets against

### `--config`
Allows to define path to the config file.
```
jscs path[ path[...]] --config=./.config.json
```

If there is no `--config` option specified, `jscs` it will consequentially search for `jscsConfig` option in `package.json` file then for `.jscsrc` (which is a just JSON with comments) and `.jscs.json` files in the current working directory then in nearest ancestor until it hits the system root.

### `--preset`
If defined will use predefined rules for specific code style.
```
jscs path[ path[...]] --preset=jquery
```

### `--reporter`
`jscs` itself provides six reporters: `checkstyle`, `console`, `inline`, `junit` and `text`.
```
jscs path[ path[...]] --reporter=console
```

But you also can specify your own reporter, since this flag accepts relative or absolute paths too.
```
jscs path[ path[...]] --reporter=./some-dir/my-reporter.js
```

### `--esnext`
Attempts to parse your code as ES6 using the harmony version of the esprima parser. Please note that this is currently experimental, and will improve over time.

### `--esprima`
Attempts to parse your code with a custom Esprima version.
```
jscs path[ path[...]] --esprima=esprima-fb
```

### `--error-filter`
The path to a module that determines whether or not an error should be reported.
```
jscs path[ path[...]] --error-filter=path/to/my/module.js
```

### `--no-colors`
Clean output without colors.

### `--max-errors`
Set the maximum number of errors to report

### `--help`
Outputs usage information.

### `--verbose`
Prepends the name of the offending rule to all error messages.

### `--version`
Outputs version of `jscs`.

## Options

### plugins

Paths to load plugins. See the wiki page for more details about the [Plugin API](https://github.com/jscs-dev/node-jscs/wiki/Plugin-API)

Values: Array of NPM package names or paths

```js
"plugins": ["jscs-plugin", "./lib/project-jscs-plugin"]
```

### additionalRules

Path to load additional rules

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"additionalRules": ["project-rules/*.js"]
```

### preset

Extends defined rules with preset rules.

Type: `String`

Values: `"airbnb"`, `"crockford"`, `"google"`, `"jquery"`, `"mdcs"`, `"wikimedia"`, `"yandex"`

#### Example

```js
"preset": "jquery"
```

If you want specifically disable preset rule assign it to `null`, like so:
```json
{
    "preset": "jquery",
    "requireCurlyBraces": null
}
```

### excludeFiles

Disables style checking for specified paths declared with glob patterns.

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"excludeFiles": ["node_modules/**", "src/!(bar|foo)"]
```

### fileExtensions

Changes the set of file extensions that will be processed.

Type: `Array` or `String` or `"*"`

Values: A single file extension or an Array of file extensions, beginning with a `.`. The matching is case _insensitive_. If `"*"` is provided, all files regardless of extension will match.

#### Example

```js
"fileExtensions": [".js", ".jsx"]
```

#### Default

```js
"fileExtensions": [".js"]
```

### maxErrors

Set the maximum number of errors to report

Type: `Number`

Default: Infinity

#### Example

```js
"maxErrors": 10
```

### esnext

Attempts to parse your code as ES6 using the harmony version of the esprima parser.

Type: `Boolean`

Value: `true`

#### Example

```js
"esnext": true
```

### esprimaOptions

Custom `options` to be passed to `esprima.parse(code, options)`

Type: `Object`

Default: `{ "tolerant": true }`

#### Example

```js
"esprimaOptions": { "tolerant": true }
```

### errorFilter

A filter function that determines whether or not to report an error.
This will be called for every found error.

Type: `String`

#### Example

```js
"errorFilter": "path/to/my/filter.js"
```

See [how to define an error filter](https://github.com/jscs-dev/node-jscs/wiki/Error-Filters).

## Error Suppression

### Inline Comments

You can disable and reenable rules inline with two special comments: `// jscs:disable` and `// jscs:enable`. Spacing in these comments is fairly lenient. All of the following are equivalent:
```js
/* jscs: enable */
// jscs: enable
```
You can use them to disable rules in several ways.

#### Disabling All Rules

Simply using `// jscs:disable` or `// jscs:enable` will disable all rules.
```js
var a = b;
// jscs:disable
var c = d; // all errors on this line will be ignored
// jscs:enable
var e = f; // all errors on this line will be reported
```

#### Disabling Specific Rules

Including a comma separated list of rules to modify after `// jscs:disable` or `// jscs:enable` will modify only those rules.
```js
// jscs:disable requireCurlyBraces
if (x) y(); // all errors from requireCurlyBraces on this line will be ignored
// jscs:enable requireCurlyBraces
if (z) a(); // all errors, including from requireCurlyBraces, on this line will be reported
```

You can enable all rules after disabling a specific rule, and that rule becomes reenabled as well.
```js
// jscs:disable requireCurlyBraces
if (x) y(); // all errors from requireCurlyBraces on this line will be ignored
// jscs:enable
if (z) a(); // all errors, even from requireCurlyBraces, will be reported
```

You can disable multiple rules at once and progressively reenable them.
```js
// jscs:disable requireCurlyBraces, requireDotNotation
if (x['a']) y(); // all errors from requireCurlyBraces OR requireDotNotation on this line will be ignored
// jscs:enable requireCurlyBraces
if (z['a']) a(); // all errors from requireDotNotation, but not requireCurlyBraces, will be ignored
// jscs:enable requireDotNotation
if (z['a']) a(); // all errors will be reported
```

## Versioning & Semver

We recommend installing JSCS via NPM using `^`, or `~` if you want more stable releases.

Semver (http://semver.org/) dictates that breaking changes be major version bumps. In the context of a linting tool, a bug fix that causes more errors to be reported can be interpreted as a breaking change. However, that would require major version bumps to occur more often than can be desirable. Therefore, as a compromise, we will only release bug fixes that cause more errors to be reported in minor versions.

Below you fill find our versioning strategy, and what you can expect to come out of a new JSCS release.

 * Patch release:
   * A bug fix in a rule that causes JSCS to report less errors.
   * Docs, refactoring and other "invisible" changes for user;
 * Minor release:
   * Any preset changes.
   * A bug fix in a rule that causes JSCS to report more errors.
   * New rules or new options for existing rules that don't change existing behavior.
   * Modifying rules so they report less errors, and don't cause build failures.
 * Major release:
   * Purposefully modifying existing rules so that they report more errors or change the meaning of a rule.
   * Any architectural changes that could cause builds to fail.
