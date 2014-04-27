# node-jscs [![Build Status](https://travis-ci.org/mdevils/node-jscs.svg?branch=master)](https://travis-ci.org/mdevils/node-jscs) [![Dependency Status](https://david-dm.org/mdevils/node-jscs.svg?theme=shields.io)](https://david-dm.org/mdevils/node-jscs) [![devDependency Status](https://david-dm.org/mdevils/node-jscs/dev-status.svg?theme=shields.io)](https://david-dm.org/mdevils/node-jscs#info=devDependencies)

JSCS — JavaScript Code Style.

`jscs` is a code style checker. You can configure `jscs` for your project in detail using **over 60** validation rules. [jQuery](https://github.com/mdevils/node-jscs/blob/master/lib/presets/jquery.json) preset is also available.

## Friendly packages

 * Grunt task: https://github.com/gustavohenke/grunt-jscs-checker/
 * Gulp task: https://github.com/sindresorhus/gulp-jscs/
 * SublimeText 3 Plugin: https://github.com/SublimeLinter/SublimeLinter-jscs/
 * Syntastic VIM Plugin: [https://github.com/scrooloose/syntastic/.../syntax_checkers/javascript/jscs.vim/](https://github.com/scrooloose/syntastic/blob/master/syntax_checkers/javascript/jscs.vim/)
 * Brackets Extension: https://github.com/globexdesigns/brackets-jscs
 * Web Essentials for Visual Studio 2013: https://github.com/madskristensen/WebEssentials2013/

## Installation

`jscs` can be installed using `npm`:

```
npm install jscs -g
```

To run `jscs`, you can use the following command from the project root:

```
jscs path[ path[...]]
```

## CLI

### `--config`
Allows to define path to the config file.
```
jscs path[ path[...]] --config=./.config.json
```

If there is no `--config` option specified, `jscs` it will consequentially search for `jscsConfig` option in `package.json` file then for `.jscsrc` and `.jscs.json` files in the current working directory then in nearest ancestor until it hits the system root.

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

### `--no-colors`
*Will be removed*. Clean output without colors.

### `--help`
Outputs usage information.

### `--version`
Outputs version of `jscs`.

## Options

### Additional rules

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

Values: `"jquery"`

#### Example

```js
"preset": "jquery"
```

If you want specifically disable preset rule assign it to `null`
```js
"preset": "jquery",
"requireCurlyBraces": null
```

### Exclude files

Disables style checking for specified paths.

Type: `Array`

Values: Array of file matching patterns

#### Example

```js
"excludeFiles": ["node_modules/**"]
```

## Browser Usage

File [jscs-browser.js](jscs-browser.js) contains browser-compatible version of `jscs`.

Download and include `jscs-browser.js` into your page.

```html
<script src="jscs-browser.js"></script>
<script>
    var checker = new JscsStringChecker();
    checker.registerDefaultRules();
    checker.configure({disallowMultipleVarDecl: true});
    var errors = checker.checkString('var x, y = 1;');
    errors.getErrorList().forEach(function(error) {
        console.log(errors.explainError(error));
    });
</script>
```