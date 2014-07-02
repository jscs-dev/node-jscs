Maintainer Guide
================

Maintainers are the core developers of the project.
Their main role is to review, merge or reject pull-requests and fix critical bugs.
Some maintainers can have areas of responsibility:

 * @mdevils: general architecture, common rules.
 * @markelog: CLI, integration, common rules.
 * @mikesherov: ex-jshint rules, common rules.

Maintaining validation rules
----------------------------

Each rule should have:

 * Implementation in `lib/rules/rule-name.js`.
 * Registration in `registerDefaultRules` method of `StringChecker` (`lib/string-checker.js`).
 * Documentation in `README.md`.
 * Tests in `lib/test.rule-name.js`

Rule interface:

```javascript

    interface Rule {
        /**
         * Configures rule before beeing used in validations.
         *
         * @param {*} ruleConfigutationValue configuration value.
         * @returns {undefined}
         * @throws Error on invalid configuration value.
         */
        configure(ruleConfigutationValue);

        /**
         * Returns option name for this rule to be used in jscs config.
         *
         * @returns {String}
         */
         getOptionName();

        /**
         * Validates file.
         *
         * @param {JsFile} file - file representation. See lib/js-file.js.
         * @param {Errors} errors - object for validation errors to write to. See lib/errors.js.
         * @returns {undefined}
         */
        check(file, errors);
    }

```

Keeping browser-version alive
-----------------------------

File `lib/string-checker.js` is used in browserify process, exporting `JscsStringChecker` class.
`string-checker.js` (and its dependencies) should not depend on `nodejs` specifics like `fs`,
`process` and so on.

Preparing for a new version
---------------------------

1. Determine, which part of the version you are about to increase.
   We are using `semver` (http://semver.org/).
   If you are just fixing bugs, increase patch version.
   For new features update minor version (and reset patch version to zero).
   For backwards incompatible changes you should update major version,
   but be sure to discuss changes with other maintainers.
2. Write changes to `CHANGELOG.md`: `npm run changelog`.
   Be sure to clean up the changelog so that changes are listed in following order:
   1. breaking changes.
   2. preset updates.
   3. new rules.
   4. new options.
   5. bug fixes.
   6. infrastructure or docs changes.
3. Commit under message: `Prepare for version x.x.x`.
4. Set a new version and tag: `npm version x.x.x`.
5. Push changes and tags: `git push && git push --tags`.
6. Ask @mdevils to publish new package for specified tag, or use `npm publish` if you have privileges.
7. Add back the "development version" notice to the README.md file.
8. Tweet or otherwise promote the fact that a new version has been released with a link to the changelog and npm download page.
9. Done!
