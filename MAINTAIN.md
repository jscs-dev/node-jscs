Maintainer Guide
================

Maintainers are the core developers of the project.
Their main role is to review, merge or reject pull-requests and fix critical bugs.
Some maintainers can have areas of responsibility:

 * @mdevils: general architecture, common rules.
 * @markelog: CLI, integration, common rules.
 * @mikesherov: ex-jshint rules, common rules.
 * @mrjoelkemp: bug fixes, common rules.

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
         * Configures rule before being used in validations.
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

Adding new presets
------------------

1. Make sure they follow the rules listed in CONTRIBUTING.md
1. Discuss the preset on the mailing list: jscs-dev@googlegroups.com
1. Once discussed and agreed upon, land the PR!

Publishing a new version
---------------------------

1. Determine which part of the version you are about to increase. See our strategy in README.md.
1. Write changes to `CHANGELOG.md`: `npm run changelog`.
   Clean up the changelog by manually clarifying and reordering the messages. Ensure the changes are listed in following order:
   1. breaking changes.
   1. preset updates.
   1. new rules.
   1. new options.
   1. bug fixes.
   1. infrastructure or docs changes.
1. Commit the changelog update with the message: `Prepare for version x.x.x`.
1. Set a new version and tag: `npm version x.x.x`.
1. Push changes and tags: `git push && git push --tags`.
1. Use `npm run release` to publish the new version to npm. **DO NOT USE `npm publish`**, as this will not perform the necessary prepublish tasks. If you don't have publish privileges, ask @mdevils to publish for you.
1. Copy the changelog notes into the Github releases section located here: https://github.com/jscs-dev/node-jscs/releases
1. Tweet or otherwise promote the fact that a new version has been released with a link to the changelog and npm download page.
1. Done!
