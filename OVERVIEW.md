<!-- toc -->

## Presets

Note: the easiest way to use a preset is with the [preset](#preset) option described below.

 * [Airbnb](https://github.com/jscs-dev/node-jscs/blob/master/presets/airbnb.json) — https://github.com/airbnb/javascript
 * [Crockford](https://github.com/jscs-dev/node-jscs/blob/master/presets/crockford.json) — http://javascript.crockford.com/code.html
 * [Google](https://github.com/jscs-dev/node-jscs/blob/master/presets/google.json) — https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 * [Grunt](https://github.com/jscs-dev/node-jscs/blob/master/presets/grunt.json) — http://gruntjs.com/contributing#syntax
 * [Idiomatic](https://github.com/jscs-dev/node-jscs/blob/master/presets/idiomatic.json) — https://github.com/rwaldron/idiomatic.js#idiomatic-style-manifesto
 * [jQuery](https://github.com/jscs-dev/node-jscs/blob/master/presets/jquery.json) — https://contribute.jquery.org/style-guide/js/
 * [MDCS](https://github.com/jscs-dev/node-jscs/blob/master/presets/mdcs.json) — [https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style™](https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2)
 * [node-style-guide](https://github.com/jscs-dev/node-jscs/blob/master/presets/node-style-guide.json) - https://github.com/felixge/node-style-guide
 * [Wikimedia](https://github.com/wikimedia/jscs-preset-wikimedia/blob/master/presets/wikimedia.json) — https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
 * [WordPress](https://github.com/jscs-dev/node-jscs/blob/master/presets/wordpress.json) — https://make.wordpress.org/core/handbook/coding-standards/javascript/

You can specifically disable any preset rule by creating a `.jscsrc` config file and assigning it to null or false, like so:
```js
{
    "preset": "jquery",
    "requireCurlyBraces": null // or false
}
```

## Friendly packages

 * Atom plugin: https://atom.io/packages/linter-jscs
 * Brackets Extension: https://github.com/globexdesigns/brackets-jscs
 * Grunt task: https://github.com/jscs-dev/grunt-jscs/
 * Gulp task: https://github.com/jscs-dev/gulp-jscs/
 * Overcommit Git pre-commit hook manager: https://github.com/brigade/overcommit/
 * SublimeText 3 Plugin: https://github.com/SublimeLinter/SublimeLinter-jscs/
 * Syntastic VIM Plugin: [https://github.com/scrooloose/syntastic/.../syntax_checkers/javascript/jscs.vim/](https://github.com/scrooloose/syntastic/blob/master/syntax_checkers/javascript/jscs.vim/)
 * Web Essentials for Visual Studio 2013: https://github.com/madskristensen/WebEssentials2013/
 * IntelliJ IDEA, RubyMine, WebStorm, PhpStorm, PyCharm plugin: https://www.jetbrains.com/webstorm/help/jscs.html
 * Visual Studio Code extension: https://github.com/microsoft/vscode-jscs

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

## Programmatic Usage

`jscs` can be used directly from your application code:

```js
var Checker = require("jscs");
var checker = new Checker();
checker.registerDefaultRules();
```

You can configure the checker instance to use specific options, or a preset:

```js
// Configure the checker with an options object
checker.configure({
    "requireCurlyBraces": [
        "if",
        "else",
        "for"
    ]
});

// Use the jQuery preset
checker.configure({
    preset: "jquery"
});

// Use the Google preset, but override or remove some options
checker.configure({
    preset: "google",
    disallowMultipleLineBreaks: null, // or false
    validateIndentation: "\t"
});
```

To check a string of code, pass it to the `checkString` method:

```js
var results = checker.checkString(stringOfCode);
var errors = results.getErrorList();
```

The results object can be used to render a descriptive explanation of each error:

```js
results.getErrorList().forEach(function(error) {
    var colorizeOutput = true;
    console.log(results.explainError(error, colorizeOutput) + "\n");
});
```

## CLI

Some CLI options can be put in your `.jscsrc` as well (such as `preset`).

---

These following options have been removed in 3.0 (since `esnext` is enabled by default) using [cst](https://github.com/cst/cst) which uses babylon as it's parser).

- `--esnext` (`-e`)
- `--esprima` (`-s`)

The `verbose` flag is removed in 3.0 since it will be on by default (so you know which rule is erroring).

---

### `--fix` (`-x`)
Will apply fixes to all supported style rules.

```
jscs path[ path[...]] --fix
```

### `--auto-configure`
Presents a walkthrough that allows you to generate a JSCS configuration by
choosing a preset and handling violated rules.

```
jscs --auto-configure path
```

`path` can be a file or directory to check the presets against

### `--config` (`-c`)
Allows to define path to the config file.
```
jscs path[ path[...]] --config=./.config.json
```

If there is no `--config` option specified, `jscs` it will consequentially search for `jscsConfig` option in `package.json` file then for `.jscsrc` (which is a just JSON with comments) and `.jscs.json` files in the current working directory then in nearest ancestor until it hits the system root.

### `--preset` (`-p`)
If defined will use predefined rules for specific code style.
```
jscs path[ path[...]] --preset=jquery
```

In order to add/remove preset rules you will need to create a `.jscsrc` config file.

### `--extract`
With this option you can set glob pattern for files which embedded JavaScript should be checked.
```
jscs path[ path[...]] --extract *.html
```

You can set several patterns if necessary.
```
jscs path[ path[...]] --extract *.html --extract *.htm
```

Currently, only the `html` format is supported (JavaScript inside `<script>` will be checked) and extracted code cannot be auto fixed.

### `--reporter` (`-r`)
`jscs` itself provides eight reporters: `checkstyle`, `console`, `inline`, `inlinesingle`, `junit`, `text`, `unix` and `json`.
```
jscs path[ path[...]] --reporter=console
```

But you also can specify your own reporter, since this flag accepts relative or absolute paths too.
```
jscs path[ path[...]] --reporter=./some-dir/my-reporter.js
```

### `--error-filter` (`-f`)
The path to a module that determines whether or not an error should be reported.
```
jscs path[ path[...]] --error-filter=path/to/my/module.js
```

### `--no-colors` (`-n`)
Clean output without colors.

### `--max-errors` (`-m`)
Set the maximum number of errors to report (pass -1 to report all errors).

### `--help` (`-h`)
Outputs usage information.

### `--version` (`-V`)
Outputs version of `jscs`.

## Options

---

> The following options have been removed in 3.0 (since `esnext` is enabled by default) using [cst](https://github.com/cst/cst) which uses babylon as it's parser)

`esnext`: Attempts to parse your code as ES6+, JSX, and Flow using babylon as the underlying parser.

`esprima`: Attempts to parse your code with a custom Esprima version.

`esprimaOptions`: Custom `options` to be passed to `esprima.parse(code, options)`

`verbose`: Prepends the name of the offending rule to all error messages.

---

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

Values: You can choose one of the default presets: `"airbnb"`, `"crockford"`, `"google"`, `"jquery"`, `"mdcs"`, `"node-style-guide"`, `"wikimedia"`, `"wordpress"`, `"idiomatic"`.

Or you can load from it local path or as node module

#### Example

```js
"preset": "jquery"
"preset": "./path-to-your-preset"

// If your preset called "jscs-your-preset-node_modules-path"
// You can either define full name or omit "jscs-" prefix -
"preset": "your-preset-node_modules-path"
```

You can specifically disable any preset rule by assigning it to null or false, like so:
```js
{
    "preset": "jquery",
    "requireCurlyBraces": null // or false
}
```

### excludeFiles

Disables style checking for specified paths declared with glob patterns.

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
// Use `"!foo"` to specifically include a file/folder
"excludeFiles": ["folder_to_exclude/**", "src/!(bar|foo)"]
```

#### Default

The `.git` and `node_modules` folders are excluded by default.

### fileExtensions

Changes the set of file extensions that will be processed.

Type: `Array` or `String` or `"*"`

Values: A single file extension or an Array of file extensions, beginning with a `.`. The matching is case _insensitive_. If `"*"` is provided, all files regardless of extension will match.

#### Example

```js
"fileExtensions": [".js", ".jsx"]
```

#### Default

`.js` files are processed by default

### extract

Set list of glob patterns for files which embedded JavaScript should be checked.

Type: `Array` or `Boolean`

Values: Array of file matching patterns

JavaScript extracting from files that doesn't match to [fileExtensions](#fileExtensions) or [excludeFiles](#excludefiles), but match to patterns in this list. Currently, only `html` format is supported.

#### Example

```js
"extract": ["*.htm", "*.html"]
```

#### Value `true`

JavaScript is extracted from files with `.htm`, `.html` or `.xhtml` extension with value `true`.

### maxErrors
Set the maximum number of errors to report (pass -1 or null to report all errors).
Ignored if `fix` option is enabled.

Type: `Number|null`

Default: 50

#### Example

```js
// Report only the first 10 errors
"maxErrors": 10

// Report all errors
"maxErrors": -1
"maxErrors": null
```

### fix
Will apply fixes to all supported style rules.

Type: `Boolean|null`

Default: `false`

### es3

Use ES3 reserved words.

Type: `Boolean`

Value: `true`

#### Example

```js
"es3": true
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

### Disabling a Rule

You can specifically disable any rule by omitting it from your `.jscsrc` config or by assigning it to null, like so:
```json
{
    "preset": "jquery",
    "requireCurlyBraces": null
}
```

### Inline Comments

You can disable and re-enable rules inline with two special comments: `// jscs:disable` and `// jscs:enable`. Spacing in these comments is fairly lenient. All of the following are equivalent:
```js
/* jscs: enable */
// jscs: enable
```
You can use them to disable rules in several ways.

#### Disabling All Rules

The placement of the special comments will disable or enable the checking of all rules against the code that appears after the comments
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

#### Disabling Specific Rules For a Single Line

Rules can be disabled for a single line with `// jscs:ignore`.
```js
if (x) y(); // jscs:ignore requireCurlyBraces
if (z) a();
```

You can enable all rules after disabling a specific rule, and that rule becomes re-enabled as well.
```js
// jscs:disable requireCurlyBraces
if (x) y(); // all errors from requireCurlyBraces on this line will be ignored
// jscs:enable
if (z) a(); // all errors, even from requireCurlyBraces, will be reported
```

You can disable multiple rules at once and progressively re-enable them.
```js
// jscs:disable requireCurlyBraces, requireDotNotation
if (x['a']) y(); // all errors from requireCurlyBraces OR requireDotNotation on this line will be ignored
// jscs:enable requireCurlyBraces
if (z['a']) a(); // all errors from requireDotNotation, but not requireCurlyBraces, will be ignored
// jscs:enable requireDotNotation
if (z['a']) a(); // all errors will be reported
```
### Disabling rule checks on the entire file

All rule checks on the entire file can be disabled by placing the special comment below on the top of the file
```js
// jscs:disable
```
As the comments are applicable only to the file they are placed in there is no requirement to put the special comment `// jscs:enable` at the end of the file.

The same concept is applicable to disable only specific rules in the file. So instead of `// jscs:disable`, you can put `// jscs:disable requireCurlyBraces` to disable a single rule or `// jscs:disable requireCurlyBraces, requireDotNotation` to disable multiple rules

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
