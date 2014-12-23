Contribution Guide
==================

Thanks for wanting to contribute! This document describes some points about the contribution process for the JSCS package.

1. [Maintainers](#maintainers)
1. [Pull Requests](#pull-requests)
 - [Before Submitting a PR](#before-submitting-a-pr)
 - [Why did you close my PR or Issue?](#why-did-you-close-my-pull-request-or-issue)
 - [PR/Issue Closing Criteria](#prissue-closing-criteria)
1. [Filing Bugs](#filing-bugs)
1. [Proposing Features](#proposing-features)
1. [Implementing Features](#implementing-features)
1. [Proposing Additional Presets](#proposing-additional-presets)
1. [Setting up Your Environment](#setting-up-your-environment)
1. [Commit Message Format](#commit-message-format)

Maintainers
-------------

The maintainers of the project are:
 * Marat Dulin (@mdevils).
 * Oleg Gaidarenko (@markelog).
 * Mike Sherov (@mikesherov).
 * Joel Kemp (@mrjoelkemp).

The project is being developed by the community. Maintainers merge pull-requests and fix critical bugs. All other features
and patches are welcomed to be implemented by community members.

Pull-requests
-------------

If you fixed or added something useful to the project, you can send a pull-request.
It will be reviewed by a maintainer and accepted, or commented for rework, or declined.

##### Before submitting a PR

1. Please review our suggested [commit message format](#commit-message-format).
1. Make sure you have tests for your modifications (we use [Mocha](http://visionmedia.github.io/mocha/) and [Assert](http://nodejs.org/api/assert.html))
 - Tests for rules are located in `test/rules`
 - Tests for presets are located in `test/options/preset`
1. Run `npm test` locally to catch any JSHint and JSCS errors.

##### Why did you close my pull request or issue?

Nothing is worse than a project with hundreds of stale issues. To keep things orderly, the maintainers try to
close/resolve issues as quickly as possible.

##### PR/Issue closing criteria

We'll close your PR or issue if:

1. It's a duplicate of an existing issue
1. Outside of the style-driven scope of the project
1. You are unresponsive after a few days
1. The bug is not reproducible
1. The feature request or rule modification request introduces too much complexity (or too many edge cases) to the tool
 - We weigh a request's complexity with the value it brings to the community.

Please do not take offense if your ticket is closed. We're only trying to keep the number of issues manageable.

Filing Bugs
----

If you found an error, typo, or any other flaw in the project,
please report it using [GitHub Issues](https://github.com/jscs-dev/node-jscs/issues). Try searching
the issues to see if there is an existing report of your bug or feature request.

When it comes to bugs, the more details you provide, the easier it is to reproduce the issue and the faster it could be fixed.

Some helpful datapoints to provide (if you can):

1. A failing test would be amazing
1. Code snippets that make jscs exhibit the issue
1. The version of jscs that you're using
1. Your operating system (Windows, Mac, or Linux)
1. Screenshots

Unfortunately, sometimes a bug can only be reproduced in your project or in your environment,
so the maintainers cannot reproduce it. In this case we welcome you to try fixing the bug; we'll be more than happy to
take a look at (and possibly incorporate) the fix.

Proposing Features
--------

If you've got an idea for a new feature, file an issue providing some details on your idea.

If it's a new rule that you're proposing:

* Provide the possible configuration inputs
 * Look at the rules in the readme for examples
* You'll also have to think about (and implement) the reverse rule (Before|After) or (Require|Disallow)
* Provide snippets to show code that your rule deems as valid and invalid.
 * Check out the readme for examples

If you'd like to modify the possible values for existing rules:

* Provide code snippets showing the need for additional configuration values

Implementing Features
--------

It's likely that you'll have to implement feature requests or enhancements on your own. To do that, you'll need
to be comfortable with JavaScript, Promises, Node.js, and familiar with [Esprima's abstract syntax tree format](http://esprima.org/demo/parse.html#).

To understand how JSCS works, the best place to start is in the `lib/` directory: starting with `lib/cli.js`
(to see the processing flow when `jscs` is invoked in the terminal) then going to `lib/checker.js` and `lib/string-checker.js`
for understanding how JSCS checks files. The `lib/js-file.js` and `lib/errors.js` contain the internal data structures.

All of the rules are located in `lib/rules` and the tests for the rules are in `test/rules`.

If you cannot implement the feature, but you feel that it would be helpful to others, you can create an issue on GitHub.
If the maintainers feel that the issue satisfies our [criteria for closing issues](#prissue-closing-criteria), your issue
will be closed with a genuine thank you and an explanation for the closure.

Proposing Additional Presets
-------

If you'd like to add an additional preset, please add the following (maintaining alphabetical order when possible):

* The new preset's configuration to `/presets`
* A file containing sample code, including any necessary license (ideally from that organization/project's codebase) to `/test/data/options/preset/`
* An integration test by adding the line `testPreset('mynewpreset');` to `/test/string-checker.js`
* The presets name to the possible values of the preset option in README.md
* A link to the preset following the existing style in the "Presets" section of README.md

Setting up your environment
-------

1. Fork the node-jscs repository
1. Clone your fork to your local machine
1. Run `npm install` in your local fork
1. Consider setting up the appropriate [JSCS editor package](https://github.com/jscs-dev/node-jscs#friendly-packages)
 - We use JSCS to check the JSCS codebase
1. Create a new branch for your fix: `git checkout -b my-fix-branch master`
1. Implement your bug fix or feature request
1. Implement the tests for your fix or feature
1. Run `npm test` frequently to find stylistic errors before issuing a PR
1. Commit your code with a commit message that follows our [commit message format](#commit-message-format)
 - If you don't feel comfortable with that format, no worries, we'll fix up your commit after merging your PR.
 - Try to have a single commit per modified/added rule

Commit Message Format
-------

We adhere to the [jQuery commit message](http://contribute.jquery.org/commits-and-pull-requests/#commit-guidelines) guidelines.

This format can be achieved via:

* `git commit` to open your editor to create a multi-line commit message

```
<rulename>: short message
<emptyline>
Long description (if useful)
<emptyline>
Closes gh-<pullRequestNumber>
Fixes #<issueNumber>
```

Example:

```
validateIndentation: remove array and object indentation validation

Fixes #627 - issue
Closes gh-545 - pull request
```

You can find other examples of this format by [viewing recent commits](https://github.com/jscs-dev/node-jscs/commits/master) made to master.
