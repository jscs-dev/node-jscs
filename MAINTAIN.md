Maintainer Guide
================

Maintainers are the core developers of the project.
Their main role is to review, merge or reject pull-requests and fix critical bugs.

See current list of maintainers on [jscs.info](http://jscs.info#maintainers).

Maintaining validation rules
----------------------------

Each rule should have:

 * Implementation in `lib/rules/rule-name.js`.
 * Documentation in `lib/rules/rule-name.js` (`JSDoc` comment should start at the beginning of the file).
 * Registration in `registerDefaultRules` method of `Configuration` (`lib/config/configuration.js`).
 * Tests in `test/specs/rules/rule-name.js`

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

Adding new presets
------------------

1. Make sure they follow the rules listed in CONTRIBUTING.md
1. Discuss the preset on the [mailing list](jscs-dev@googlegroups.com) or [gitter room](https://gitter.im/jscs-dev/node-jscs)
1. Once discussed and agreed upon, land the PR!

Merging a PR
------------

We never hit the Merge pull request button on github. This avoids merge commits which makes history muddy.
We generate changelogs from the history, so the less noise – the better.

We never change history on master.
If you make a mistake and push up a silly commit to upstream's master, then you issue a revert commit, you do not remove the commit from the history and force push up.

Example Merging Workflow
----------------

1. Checkout the PR locally `hub checkout the_pull_request_url` (download [hub](https://github.com/github/hub))
2. Make sure that the PR is up to date with master `git pull --rebase upstream master`
  - This is assuming you have a remote upstream pointing to git@github.com:jscs-dev/node-jscs.git
3. Make sure the PR is still passing all tests at this point: `npm test`
4. Fix up the commit message (according to the [suggested format](https://github.com/jscs-dev/node-jscs/blob/master/CONTRIBUTING.md#commit-message-format))
 - Make sure any issue numbers are listed if it's a bug fix: `Fixes #123`
 - Make sure the commit closes the PR number: `Closes gh-124`
 - Make sure any referenced issues are listed: `Ref #111`
 - If they have a single commit, then `git commit --amend` to `reword` that commit according to the above rules.
 - If they have multiple commits, then `git rebase -i the_SHA_before_their_first_commit` and `fixup` all commits except the top most. `reword` the top-most commit according to the above rules.
5. Save the commit changes and exit the editor of that tab of the editor
6. The rebase should be carried out without a problem
 - If you run into problems, `git rebase --abort` and ask another maintainer for help, or fix the merge conflicts yourself.
7. `git checkout master && git pull upstream master && git merge -`
 - This should result in a *fast-forward* merge. If you have a recursive merge, then you did something wrong.
8. For sanity sake, feel free to run the test suite again post-merge: `npm test`
9. Once it's all passing, `git push upstream master` to push that commit to the master branch of the main jscs repo.

Publishing a new version
---------------------------

1. Determine which part of the version you are about to increase. See our strategy in OVERVIEW.md.
1. Check out the [previous releases](https://github.com/jscs-dev/node-jscs/releases) for how we write our changelogs. We tend to write out a summary at the beginning and explanatory paragraphs for anything that needs further clairification.
1. Use `npm run changelog` to get a gist of the changes. Use these to determine what should be included in the changelog.
1. Some categories we use: New Rules, New Rule Options, Bug Fixes, Internal Changes, Preset Updates, CLI/Config changes.
1. Write changes to `CHANGELOG.md`.
1. Commit the changelog update with the message: `Misc: add x.x.x changelog`.
1. Set a new version and tag: `npm version x.x.x`.
1. Push changes and tags: `git push && git push --tags`.
1. Use `npm run release` to publish the new version to npm. **DO NOT USE `npm publish`**, as this will not perform the necessary prepublish tasks. If you don't have publish privileges, ask @mdevils to publish for you.
1. Copy the changelog notes into the Github releases section located here: https://github.com/jscs-dev/node-jscs/releases
1. Rebuild the website: `git clone git@github.com:jscs-dev/jscs-dev.github.io.git && cd jscs-dev.github.io && npm install && npm run publish`
1. Tweet or otherwise promote the fact that a new version has been released with a link to the changelog and npm download page.
1. Done!
