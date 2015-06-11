## Version 1.13.1

### Overview
Small update for fix distribution of the `--esnext` CLI option (#1321)

### Bug fixes
* CLI: use "esnext" cli option in the configuration module (Oleg Gaidarenko)
* CLI: ensure options to path.resolve are strings (Jason Karns)
* disallowMultipleSpaces: fix configuration error message (Marc Knaup)

### Docs
* Docs: correct example for the "requireCapitalizedComments" rule (XhmikosR)
* Docs: Update mixup between rules in docstring example (Jérémie Astori)
* Docs: Fix missing quotes in a docstring example (Jérémie Astori)
 
## Version 1.13.0

### Overview

This is mostly an incremental update, which includes important fixes for annoyances like `npm ERR! EEXIST, symlink` error at `npm install`. We also improved ES6 support, added seven new rules, three new rule values and now you can declare `verbose` option at the config.

There are no preset updates in this release, but if you feel that rules are missing in
the supported [presets](http://jscs.info/overview.html#presets) - please send us a PR.

We eagerly wait for the Esprima 2.3 release, since soon after, `esnext` option will be set to `true` by default.

We would like specifically thanks @TheSavior and @hzoo for their hard work on this release.

### New options
* New option: add "verbose" option as a config option (Oleg Gaidarenko)

### New rules
* New rule: validateAlignedFunctionParameters (Bram Cordie)
* New rule: (disallow|require)PaddingNewLinesBeforeExport (Eli White)
* New rule: validateNewlineAfterArrayElements (Alexej Yaroshevich)
* New rule: (require |disallow)NamedUnassignedFunctions (Todd Wolfson)
* New rule: maximumNumberOfLines (Henry Zhu)
* New rule: (disallow|require)PaddingNewLinesAfterUseStrict (Eli White)
* New rule: disallowNotOperatorsInConditionals (Henry Zhu)

### New rule values
* requirePaddingNewLinesAfterBlocks: add exceptions (Eli White)
* requireSpaceBeforeBlockStatements: add number of spaces argument (Oleg Pesok)
* requireDollarBeforejQueryAssignment: add "ignoreProperties" rule value (Alexej Yaroshevich)

### Bug fixes
* paddingNewLinesBeforeLineComments: code and comment on the same line (Oleg Gaidarenko)
* disallowKeywordsOnNewLine: "do..while" on new line (oredi)
* requirePaddingNewLinesBeforeLineComments: first token and not first line (Eli White)
* Errors: should not show rule for "Unsupported rule" error (Oleg Gaidarenko)
* requireOperatorBeforeLineBreak: autofix by moving operator (Nick Santos)
* disallowIdentifierNames: fix errors with using object properties as an identifier (Henry Zhu)
* requireDollarBeforejQueryAssignment: Allow leading underscores before $ sign (Eli White)
* requireCamelCaseOrUpperCaseIdentifiers: skip es5 getters if ignoreProperties is set (Alexej Yaroshevich)
* requireSemicolons: fix warning positions (Roman Dvornov)
* requireMultipleVarDecl: fix switch statement case (Todd Wolfson)
* paddingNewLineAfterVariableDeclaration: simlification and more tests (Oleg Gaidarenko)
* paddingNewLineAfterVariableDeclaration: add check for let and const (Martin Kolárik)
* paddingNewLineAfterVariableDeclaration: do not trip off on the semicolon (Oleg Gaidarenko)
* paddingNewLinesAfterBlocks: ease up on function calls (Oleg Gaidarenko)
* requirePaddingNewLineAfterVariableDeclaration: allow exception (Henry Zhu)
* requireLineBreakAfterVariableAssignment: add check for let and const (Henry Zhu)
* requireCapitalizedComments: handle textblocks correctly (Martin Kolárik)

### Misc
* js-file: small JSDoc improvement (Oleg Gaidarenko)
* Tests: fix node-style-guide preset (Martin Kolárik)
* Utils: add "true" and "false" to list of reserved words (Dmitry Sorin)
* Update esprima-harmony version (Oleg Gaidarenko)
* Tests: Add a test helper for asserting errors and autofix (Eli White)
* disallowKeywordsOnNewLine: make jshint happy (Oleg Gaidarenko)
* disallowMultipleVarDecl: add test for var inside switch clause (Alexej Yaroshevich)
* errors: additional tests, coverage (Alexej Yaroshevich)
* string-checker: wrap rule.check into try-catch (Alexej Yaroshevich)
* errors: fix test flow with filtering (Alexej Yaroshevich)

### Docs
* Docs: add link to overcommit under "Friendly packages" (Joe Lencioni)
* Docs: add a message to mention the verbose option (Henry Zhu)
* Docs: clarify that CLI options can be used in the config (Henry Zhu)
* Docs: clarify that disallowMultipleSpaces matches tabs and spaces (Henry Zhu)
* Docs: clarify how to disable a rule and use a config file (Henry Zhu)
* Docs: Clarify behavior of requireCamelCaseOrUpperCaseIdentifiers (Henry Zhu)
* Docs: fix disallowMultipleSpaces rule name in CHANGELOG (Alexej Yaroshevich)
* Docs: add two new presets to list of preset values (Jed Wood)
* Docs: add link to the preset option from the list of presets (Steve Lee)
* Docs: add shorten flags to cli (Henry Zhu)
* Docs: add auto fix option to cli docs (Henry Zhu)
* Docs: fix disallowMultipleSpaces invalid example (Henry Zhu)
* Docs: fix various docs typos (Eli White)

## Version 1.12.0

### Overview
Ladies and Gentlemen... Elvis is in the building - auto-fixing is finally here! We were working really hard to make this powerful new feature, and to make it right. We're hoping it will truly help make your code look good.

Auto-fixing supports the [EOF rule](http://jscs.info/rules.html#requirelinefeedatfileend) and all rules related to spacing, including [validateIndentation](http://jscs.info/rules.html#validateindentation) which is the most complicated rule we have (big thanks to @mikesherov for making that happen). 

Although this chunk of rules covers most of the popular use-cases, we're determine to add more rules to this list, please help us out and report any bugs or consider contributing with some code - http://jscs.info/contributing.html. We're really friendly to every new contributor.

Apart from auto-fixing, there are six new rules – fresh out of the oven. Special thanks goes to @lahmatiy, who had the patience and perseverance to implement [`requireSemicolons`](http://jscs.info/rules.html#requiresemicolons).

Because of tireless efforts of @hzoo, we're adding two new presets in this release - [`node-style-guide`](https://github.com/felixge/node-style-guide ) and [`wordpress`](https://make.wordpress.org/core/handbook/coding-standards/javascript). They have pretty consistent style guides... try it out; They are a breeze to work with.

We're very grateful to everyone who helped out with this release, especially to @TheSavior who helped review the pull requests and shape out our API.

### Preset updates
* Preset: remove "requireMultipleVarDecl" rule from jquery preset (Oleg Gaidarenko)
* Preset: wordpress (Henry Zhu)
* Preset: Add "requireSemicolons" rule to the Yandex preset (ikokostya)
* Preset: Add validate indentation rule for Yandex (Gunnar Lium)
* Preset: node-style-guide (Henry Zhu)
* Preset: update airbnb preset (Eli White)
* Preset: require blank line before all line comments for jQuery preset (Eli White)
* Preset: Add "requireSpaceBeforeObjectValues" to crockford test (Jackson Ray Hamilton)

### Auto-fixing
* validateIndentation: autofixing! (Mike Sherov)
* TokenAssert: only fix lines when comments do not exist between tokens (Mike Sherov)
* disallowMultipleLineString: do not yet allow autofixing, which is a non-whitespace change (Mike Sherov)
* disallowSemicolons: do not yet allow autofixing, which is a non-whitespace change (Mike Sherov)
* Autofixing: add more rules to use assertion framework (Henry Zhu)
* Autofixing: make most rules use assertion framework when possible (Eli White)
* Autofixing: initial implementation (mdevils)
* Autofixing: token data (mdevils)

### New rules
* New Rule: requireSemicolons (Roman Dvornov)
* New Rule: disallowMultipleSpaces (Todd Wolfson)
* New Rule: disallowIdentifierNames (alawatthe)
* New Rule: requirePaddingNewLineAfterVariableDeclaration (Evan Jacobs)
* New Rule: requireDollarBeforejQueryAssignment (Eli White)
* New Rules: (disallow/require)PaddingNewLinesBeforeLineComments (Eli White)

### Rule Values
* requireCapitalizedComments: Add `allExcept` option (Ash Clarke)

### Auto-configuration
* Auto-Configuration: show error count when handling violated rules (fubu)
* Auto-Configuration: show number of violated rules (fubu)

### CLI
* CLI: simplify and increase coverage of "cli-config" module (Oleg Gaidarenko)
* CLI: increase coverage of the "cli" module (Oleg Gaidarenko)

### Bug fixes
* (require|disallow)spacesIn*: add more invalid examples and fixes for rules (Henry Zhu)
* disallowSpacesInsideArrayBrackets: fix error messages (Henry Zhu)
* requireSpacesInsideArrayBrackets: comments should be also taken into account (gero3)
* disallowSpaceBeforeBinaryOperators: comments are allowed (gero3)
* requireLineBreakAfterVariableAssignment: allow exception for init part of for loop (Henry Zhu)
* (require|disallow)SpacesInsideArrayBrackets: use includeComments in token (Henry Zhu)
* disallowAnonymousFunctions: remove errant "s" from error message (James Chin)
* disallowDanglingUnderscores: Corrected rule name in assert message (Oswald Maskens)
* Parsing: Extend estraverse rules to support both XJS and JSX (Henry Zhu)
* (disallow/require)PaddingNewLinesAfterBlocks: Ignoring the end of files (Eli White)
* requirePaddingNewLinesBeforeLineComments: Allow consecutive comments and firstAfterCurly exception (Eli White)

### Misc
* disallowSpacesInsideParentheses: fix es6 template literal token issues (Mike Sherov)
* RequireAlignedObjectValues: use assertions (Mike Sherov)
* DisallowMultipleLineBreaks: use assertions (Mike Sherov)
* Tests: Move to spec folder (Joel Kemp)
* Tests: Adding some more fix tests (Eli White)
* Tests: move specs into a subdir so that tests, fixtures, and utilities aren't intermingled (Mike Sherov)
* Misc: update dependencies (Oleg Gaidarenko)
* JsFile: Make getTokens include comments (Eli White)
* Assertions: Add fixing tests to several rules (Eli White)
* Assertions: add tests for linesBetween (Mike Sherov)
* Assertions: Make sure newlines get fixed (gero3)
* TokenAssert: remove newline fixing logic duplication to prepare for further fixes (Mike Sherov)
* TokenAssert: simplify and strengthen linesBetween rules (Mike Sherov)
* Token Assert: normalize whiteSpace assertions to match line assertions (Mike Sherov)
* requireLineFeedAtFileEnd: make use of assert (gero3)
* Don't trim whitespace in markdown-files (Simen Bekkhus)
* Cleanup: use this.getOptionName() for consistency, options variable (Henry Zhu)
* Cleanup: use iterateTokensByTypeAndValue where appropriate (Mike Sherov)
* Cleanup: remove archaic functions from JsFile (Mike Sherov)
* Cleanup: remove usage of getComment(After|Before)Token (Mike Sherov)
* Cleanup: remove redundant boolean check, use consistent error messages (Henry Zhu)
* Cleanup: use iterateTokensByTypeAndValue and this.getOptionName() (Henry Zhu)
* requireSpaceAfterKeywords: use token assert (Henry Zhu)
* JsFile::getFirstTokenOnLine implementation (for indentation rules) (mdevils)
* Replaces the 'colors' and 'supports-colors' packages with 'chalk'. (Joshua Appelman)
* Fix various doc typos (Jérémie Astori)
* requirePaddingNewLinesAfterBlockDeclarations / disallowPaddingNewLinesAfterBlockDeclarations Adding an option to specify lines for errors.assert.differentLine (Eli White)
* JsFile: add getLineBreaks function to support future whitespace fixes (Mike Sherov)
* Appveyor: freeze node version to 0.12.x (Alexej Yaroshevich)
* requireCapitalizedComments: automatically except `jscs` comments (James Reggio)

### Docs
* Docs: Change "Values" and "Types" to grammatically correct forms (Shmavon Gazanchyan)
* Docs: add reporter (sanemat)
* Docs: less.js uses jscs (Bass Jobsen)
* Docs: added Goodvidio to the list of adopters (Adonis K)
* Fix types and descriptions in documentation (Shmavon Gazanchyan)

## Version 1.11.3

### Bug Fixes
* JsFile: ensure getLinesWithCommentsRemoved does not alter future getComments calls. (Mike Sherov)

### Misc.
* modules/utils normalizePath: fixed test for windows env (Alexej Yaroshevich)

## Version 1.11.2

### Bug Fixes
* validateIndentation: ignore empty module bodies (Mike Sherov)
* Object rules: ignore ES5 getters/setters when appropriate. (Mike Sherov)
* Ensure esprimaOptions is not mistaken for a rule (Yannick Croissant)

### Infrastructure Changes
* CI: Add AppVeyor (Adeel)

### Misc.
* Add @zxqfox to the list of maintainers (mdevils)

## Version 1.11.1

### New Rules / Rule Values
* disallowSpaceAfterObjectKeys: implement ignoreSingleLine and ignoreMultiLine options (Henry Zhu)

### Bug Fixes
* disallowAllowSpacesInsideParentheses: reintroduce archaic "all" config option (Mike Sherov)
* requireSpaceBetweenArguments: loosen rule restriction (Mike Sherov)
* Object Key rules: ignore method syntax (Alexej Yaroshevich)
* (require|disallow)TrailingComma: fixed error location (Alexej Yaroshevich)

### Infrastructure Changes
* Auto-generate: Move promisify to utils (Joel Kemp)

### Misc.
* JSHint: add unused true (Mike Sherov)
* Updating rules to use File Traversal APIs. (Eli White)
* Docs: Add website rebuild instructions to maintenance (Mike Sherov)

## Version 1.11.0

### Preset Updates
* Preset: add "requireSpaceBetweenArguments" rule to all presets (Oleg Gaidarenko)
* Presets: Remove use of outdated validateJSDoc rule (Joel Kemp)
* Preset: Add "requireSpacesInsideParentheses" to jquery preset (Oleg Gaidarenko)
* Preset: switch multipleVarDecl rule in airbnb preset (Martin Bohal)
* Preset: change value of "requireDotNotation" rule for jquery preset (Oleg Gaidarenko)

### New Config Options
* Configuration: Auto-generation (Joel Kemp)
* Config: Add support for custom Esprima options. (Chris Rebert)

### New Rules / Rule Values
* New Rule: disallowKeywordsInComments (Joe Sepi)
* New Rules: (require|disallow)SpacesInsideBrackets (Mike Sherov)
* validateIndentation: new rule value - includeEmptyLines (Jonathan Gawrych)
* disallowTrailingWhitespace: new rule value - ignoreEmptyLines (Jonathan Gawrych)
* New Rule: disallowCurlyBraces (Henry Zhu)
* requireCapitalizedConstructors: accept list of exempt constructors (Sam L'ecuyer)
* validateIndentation: exception to indentation rules for module pattern (Mike Sherov)

### Bug Fixes
* (require|disallow)SpacesInsideArrayBrackets: only check for ArrayExpressions (Mike Sherov)
* JsFile: remove all duplicate tokens. (Mike Sherov)
* ObjectExpression Rules: take into account shorthand syntax. (Mike Sherov)
* disallowSpaceBeforeKeywords: don't report an error on back-to-back keywords (Mike Sherov)
* requireParenthesesAroundIIFE: fix crash on semicolon-free IIFE (Yuheng Zhang)
* Parsing: tolerate non-leading import statements (Chris Rebert)
* requireCapitalizedComments: improve letter recognition (Mathias Bynens)
* requireSpaces*: fix error message to 'Exactly one space required' (Henry Zhu)
* StringChecker: leading hashbangs should still report correct error line numbers (Mike Sherov)
* validateIndentation: don't check bracelets else indentation. (Mike Sherov)
* validateIndentation: don't consider return when classifying break indentation (Mike Sherov)
* validateIndentation: fix multiline while in doWhile statements (Mike Sherov)
* validateIndentation: ensure pushes and pops are matching (Mike Sherov)
* validateIndentation: ensure semicolon free indentations are on correct line (Mike Sherov)
* SpaceBetweenArguments: catch call expression arguments (Oleg Gaidarenko)
* token-assert: add check for document start to prevent crashes (Alexej Yaroshevich)
* requireSpaceBeforeBlockStatements: reworded an error message (Alexej Yaroshevich)

### Infrastructure Changes
* js-file: added getCommentAfter/BeforeToken functions (Alexej Yaroshevich)
* cleanup: remove lib/token-helper (Mike Sherov)
* JsFile: move getLinesWithCommentsRemoved from comment-helper (Mike Sherov)

### Misc.
* disallowSpacesInsideArrayBrackets: fix rule name in example (Gustavo Henke)
* Misc: update dependencies (Oleg Gaidarenko)
* various rules: use tokenAssert (Henry Zhu)
* Speed up builds by using Docker-based Travis CI (Pavel Strashkin)
* 100% code coverage on various files(Mike Sherov)
* disallowSpace(Before | After)Keywords: more tests (Alexej Yaroshevich)
* requireCurlyBrace: more tests (Alexej Yaroshevich)
* CLI: correct JSDoc comment (Oleg Gaidarenko)
* requireQuotedKeysInObjects: fixing file permissions (Joe Sepi)
* Changelog: correct version number (Oleg Gaidarenko)
* Docs: add missed commit to the changelog (Oleg Gaidarenko)
* Misc: .editorconfig - fix for invalid indent_style value (Dmitriy Schekhovtsov)
* Update regenerate to ~1.2.1 (Chris Rebert)
* Add description to commander CLI help (Chris Rebert)

## Version 1.10.0
* Preset: correct wikimedia preset test (Oleg Gaidarenko)
* Preset: correct jquery preset test (Oleg Gaidarenko)
* Preset: add disallowKeywordsOnNewLine rule to google preset (Oleg Gaidarenko)
* Preset: add "requireSpacesInForStatement" rule to the presets (Oleg Gaidarenko)
* Preset: add 'catch' to "disallowKeywordsOnNewLine" rule for wikimedia (James Forrester)

* disallowSpacesInForStatement: Disallow spaces in between for statement (gero3)
* requireSpacesInForStatement: Requires spaces inbetween for statement (gero3)
* New rule: requireQuotedKeysInObjects (hpshelton)

* disallowSpacesInsideObjectBrackets: implement "allExcept" option (Oleg Gaidarenko)
* requireSpacesInsideObjectBrackets: implement "allExcept" option (Oleg Gaidarenko)
* disallowSpacesInsideArrayBrackets: implement "allExcept" option (Oleg Gaidarenko)
* requireSpacesInsideArrayBrackets: implement "allExcept" option (Oleg Gaidarenko)
* requireDotNotation: new rule value - except_snake_case (Alexej Yaroshevich)

* Configuration: ability to specify and query es3/es6 support in files. (Mike Sherov)

* cli-config: add "getReporter" method (Oleg Gaidarenko)

* requireSpaceBeforeBlockStatements: fix for else statement (Oleg Gaidarenko)
* disallowSpaceBeforeBlockStatements: fix for else statement (Beau Gunderson)
* disallowKeywordsOnNewLine: add special case for "else" without braces (Oleg Gaidarenko)
* validateIndentation: fix bug with anonymous function return in switch case (Mike Sherov)
* validateIndentation: fix bug with brace-less if in a switch case. (Mike Sherov)
* validateIndentation: fix bug with indentation of bare blocks. (Mike Sherov)
* disallowSpaceAfterBinaryOperators: report correct operator error (Oleg Gaidarenko)
* requireSpaceAfterBinaryOperators: report correct operator error (Oleg Gaidarenko)
* Fixes #909 (wrong type for disallow-capitalized-comments) (alawatthe)
* token-assert: add guards for token and subjectToken properties (Oleg Gaidarenko)
* ESNext: update esprima to properly parse regex tokens (Mike Sherov)
* requireNewlineBeforeBlockStatements: add guard for the first symbol (Oleg Gaidarenko)
* disallowNewlineBeforeBlockStatements: add guard for the first symbol (Oleg Gaidarenko)
* requireDotNotation: require dots for es3 keywords when not in es3 mode (Mike Sherov)
* JsFile: make getNodeByRange check condition less strict (gero3)
* requireSpacesInConditionalExpression: notice parentheses (Alexej Yaroshevich)
* disallowSpacesInConditionalExpression: notice parentheses (Alexej Yaroshevich)
* requirePaddingNewlinesBeforeKeywords: add token exceptions (jdlrobson)
* requireLineBreakAfterVariableAssignment: fix edge cases (jdlrobson)

* Docs: various readme fixes (Oleg Gaidarenko)
* Docs: improve "excludeFiles" documentation (Alex Yaroshevich)
* Docs: Fixed level for 1.9.0 to be the same as for 1.8.x (Alexander Artemenko)
* README: Fix Bootstrap's name (Chris Rebert)

* requireOperatorBeforeLineBreak: Use the new assertion framework (hpshelton)
* cli-config: add JSDoc for exposed methods (Oleg Gaidarenko)
* (require | disallow)SpacesInsideObjectBrackets: add bunch of newlines (Oleg Gaidarenko)
* Misc: make jscs happy (Oleg Gaidarenko)
* disallowSpaceBeforeBlockStatements: correct test names (Oleg Gaidarenko)
* disallowSpaceBeforeBlockStatements: use assertion API (Oleg Gaidarenko)
* requireKeywordsOnNewLine: use assertion API (Oleg Gaidarenko)
* Misc: complitly replace hooker with sinon (Oleg Gaidarenko)
* CLI: correct tests for the "reporter" option (Oleg Gaidarenko)
* (require | disallow)NewlineBeforeBlockStatements: remove needless guards (Oleg Gaidarenko)
* (require | disallow)NewlineBeforeBlockStatements: use assertion API (Nicholas Bartlett)
* Move website to a different repo (mdevils)
* utils: add isSnakeCased, trimUnderscores methods (Alexej Yaroshevich)
* requireSpace(Before|After)BinaryOperators: Add tests for error column (hpshelton)
* modules/checker: call spy.restore() after assertions in checkStdin (Alexej Yaroshevich)
* Misc: correct file flags - chmod -x (Oleg Gaidarenko)
* Build: update dependencies (Oleg Gaidarenko)

## Version 1.9.0
* Preset: update wikimedia preset (Timo Tijhof)
* Preset: update crockford preset (Jackson Ray Hamilton)

* New Rules: (require | disallow)SpaceBetweenArguments (James Allardice)
* New Rules: requireLineBreakAfterVariableAssignment (jdlrobson)
* New Rules: disallowSemicolons (Christopher Cliff)

* CLI: relative path resolving fix (mdevils)
* requireCurlyBraces: correctly set error pointer (Oleg Gaidarenko)
* requireOperatorBeforeLineBreak: Detect binary operator after literal (Lucas Cimon)
* requireCapitalizedComments: correct letter recognition (alawatthe)

* CLI: Remove duplicated error reporting code paths (Mike Sherov)
* CLI: remove duplicated preset existence check (Mike Sherov)
* Iterator: extend estraverse rules to support JSX (Yannick Croissant)
* Iterator: use estraverse in tree-iterator. (mdevils)
* CLI: Move configuration override to node-configuration (Mike Sherov)

* Docs: small correction to contributing guide (Oleg Gaidarenko)
* Docs: fixed incorrect rule name in example (alawatthe)
* Docs: added keywords for Googleability (Devin Ekins)
* Docs: Correct documentation for disallowOperatorBeforeLineBreak (jdlrobson)
* Docs: Added quotes for uniformity (Callum Macrae)
* Docs: Typo fix (Alexander Sofin)
* Docs: fix urls to yandex codestyle (Andrey Morozov)

## Version 1.8.1
 * Assertions: always allow new lines in whitespaceBetween (Henry Zhu)
 * Tests: reorganization, full coverage for JsFile (mdevils)

## Version 1.8.0
 * Preset: Grunt (Joel Kemp)
 * Preset: remove "disallowMultipleLineBreaks" rule from crockford preset (Oleg Gaidarenko)

 * New Rules: disallowOperatorBeforeLineBreak (jdlrobson)
 * New Rules: (require | disallow)PaddingNewlinesBeforeKeywords (Anton Vishnyak)
 * New Rules: disallowSpaceBeforeKeywords (Bryan Donovan)
 * New Rules: requireSpaceBeforeKeywords (Bryan Donovan)

 * Parsing: Ability to specify a custom esprima version via CLI or config (Konstantin Tarkus)
 * Errors: Support a filter to control which errors are reported (Joel Kemp)
 * Assertions: better rule error reporting. (mdevils)
 * Better configuration, plugin support (mdevils)

 * disallowDanglingUnderscores: Support an array of additional exceptions (Henry Zhu)
 * requireTrailingComma: add option ignoreSingleLine (eltacodeldiablo)
 * StringChecker: unsupported rules shown as style errors and not thrown exceptions (Joel Kemp)
 * Iterate over "export" statement of ES6 (Oleg Gaidarenko)
 * disallowMultipleVarDecl: add exception for undefined variable declarations (Henry Zhu)
 * disallowDanglingUnderscores: add "super_" to allowed identifier list (Markus Dolic)
 * disallowSpacesInAnonymousFunctionExpression: set correct error pointer (Oleg Gaidarenko)
 * requireSpaceAfterLineComment: add "except" option (Alexej Yaroshevich)

 * validateParameterSeparator: fix for multiple spaces between parameters (Henry Zhu)
 * Added test and patch for `finally` as a spaced keyword (Todd Wolfson)
 * requireCapitalizedComments: Better support for multi-line comments (indexzero)
 * disallowSpaceBeforeKeywords: Fix assertion typo (Jeremy Fleischman)
 * Errors: Simplify rules debugging and prevent crashes in error reporters (Alexej Yaroshevich)
 * Correct error message for "requireSpaceAfterKeywords" rule (Bryan Donovan)

 * Docs: Fix Yandex codestyle link (Garmash Nikolay)
 * Docs: Added clarification of tokens in disallowSpacesInConditionalExpression (indexzero)
 * Docs: add twitter and mailling list links (Oleg Gaidarenko)
 * Docs: add more specific cases for function spaces rules (Henry Zhu)
 * Docs: make indentation to be consistent at 4 spaces (Henry Zhu)
 * Docs: Correct docs for requireAnonymousFunctions rule (Oleg Gaidarenko)
 * Docs: Clarify "config" option (MaximAL)
 * Docs: Add Plugins section (Alexej Yaroshevich)

## Version 1.7.3
 * Parsing: Use the harmony parser via the esnext flag in the config (Joel Kemp)
 * validateIndentation: handle breakless case statements (Mike Sherov)

## Version 1.7.2
 * validateIndentation: fix return in switch failure (Mike Sherov)
 * Cast StringChecker maxErrors property to Number the first time (Florian Fesseler)
 * Fix format of --esnext and --max-errors in README (Joe Lencioni)

## Version 1.7.1
 * validateIndentation: fix empty multiline function body regression (Mike Sherov)

## Version 1.7.0
 * validateJSDoc: Deprecate rule (Joel Kemp)
 * Updated google preset (Richard Poole)
 * Add "requireSpaceBeforeBlockStatements" rule into the jquery preset (Oleg Gaidarenko)

 * CLI: Support --esnext to Parse ES6. (Robert Jackson)
 * CLI: Support a --max-errors option to limit the number of reported errors (mdevils)

 * New Rules: (require|disallow)CapitalizedComments (Joel Kemp)
 * New Rules: (require|disallow)SpacesInCallExpression (Mathieu Schroeter)
 * New Rules: (disallow|require)FunctionDeclarations (Nikhil Benesch)
 * New Rules: (require|disallow)PaddingNewLinesInObjects (Valentin Agachi)

 * Implement "only" for parens rule (Oleg Gaidarenko)
 * Simplify "allButNested" option for spaces rule (Oleg Gaidarenko)
 * Implement "except" option for spaces rule (Oleg Gaidarenko)
 * disallowMultipleVarDecl: Strict mode to disallow for statement exception (Joel Kemp)

 * disallowSpaceBeforeObjectKeys: fix parenthesised property value (Jindrich Besta)
 * requireSpaceBeforeObjectValues: fix parenthesised property value (Jindrich Besta)
 * validateIndentation: Allow non-indented "break" in "switch" statement (kevin.destrem)
 * ValidateIndentation: remove array and object indentation validation (Mike Sherov)
 * validateIndentation: Allow the "if" test to be nested. (Jesper Birkestrøm)
 * ValidateIndentation: Relax indentation rules for function expressions. (Mike Sherov)
 * requireCurlyBraces: support the with statement (Joel Kemp)
 * Fix invalid result of findXxxxToken methods when value is provided (Romain Guerin)
 * requireSpaceAfterLineComment: skips msjsdoc comments (Alexej Yaroshevich)

 * Docs: add a table of contents to README (Henry Zhu)
 * Docs: Make version numbers real markdown headers (Alexander Artemenko)

## Version 1.6.2
 * Fix disallowMultipleLineBreaks with shebang line (Nicolas Gallagher)
 * Improve validateParameterSeparator rule (David Chambers)
 * Add rule for parameter separation validation (James Allardice)
 * Add new rules for object values (Vivien TINTILLIER)
 * Docs: add intellij plugin to friendly packages (idok)
 * Support predefined values for another three rules (Joel Kemp)

## Version 1.6.1
 * Airbnb preset (Joel Kemp)
 * Improve crockford preset (Vivien TINTILLIER)
 * Avoid node.js 0.10.x exit code bug for MS Windows (Taku Watabe)
 * Docs: Update packages and extensions sections with new URLs. (Mike Sherov)

## Version 1.6.0
 * Errors: ability to suppress errors via inline comments. (Mike Sherov)
 * Fix Anonymous Functions in google preset (Ayoub Kaanich)
 * Enhance google's preset (Joel Kemp)
 * Add "iterateTokenByValue" method (Oleg Gaidarenko)
 * Node -> Tokens navigation, token list navigation (Marat Dulin)
 * Do not strip json config from comments (Oleg Gaidarenko)
 * maximumLineLength should not be destructive (Oleg Gaidarenko)
 * Use tilde for package definition (Jordan Harband)
 * Improve stdin support (Joel Kemp)
 * Use correct logic for piped input (Joel Kemp)
 * Properly concatenate large files read from stdin (Nikhil Benesch)
 * Add link to the Atom editor plugin for JSCS (Addy Osmani)
 * Setting default tree to empty object (Bryan Donovan)

## Version 1.5.9
 * Binary Rules: Remove colon check from all binary rules (Oleg Gaidarenko)
 * Presets: Add Mr. Doob's Code Style (MDCS) (gero3)
 * Presets: Add Crockford (Timo Tijhof)
 * Google Preset: Add missing constraints (Turadg Aleahmad)
 * Yandex Preset: Remove repeated rule in yandex preset (Benjamin Tamborine)
 * Yandex Preset: updated to be more accurate (ikokostya)
 * New Rules: (require|disallow)NewlineBeforeBlockStatements (cipiripper)
 * New Rules: (require|disallow)AnonymousFunctions (Rachel White)
 * New Rules: (disallow|require)SpacesInFunction (Mike Sherov)
 * CLI: Accepts piped input from stdin (Joel Kemp)
 * CLI: Add --verbose option that adds rule names to error output. (Mike Sherov)
 * Errors: report Esprima parse errors as rule violations. (Mike Sherov)
 * disallowMultipleLineBreaks: fix issues with shebang line (Bryan Donovan)
 * spacesInFunctionExpressions: ignore function declarations. (Mike Sherov)

## Version 1.5.8
 * Errors: include which rule triggered the error in the error output (gero3)
 * requireTrailingComma: Allow single property objects  / arrays to ignore the rule. (Joel Kemp)
 * requireTrailingComma: Avoids false positives from non object/array literal definitions. (Joel Kemp)
 * validateIndentation: fix indentation for non-block `if` that has block `else`. (Mike Sherov)
 * maximumLineLength: Document the required and default values. (Joel Kemp)

## Version 1.5.7
 * Exclude colon from binary rule of yandex preset (Oleg Gaidarenko)
 * wikimedia: Add 'case' and 'typeof' to requireSpaceAfterKeywords (Timo Tijhof)
 * Correct deal with exclusion and extensions (Oleg Gaidarenko)
 * disallowPaddingNewlinesInBlocks: fix false negatives with newline after closing curly. (Iskren Chernev)
 * Include jscs-browser file to npm package (Oleg Gaidarenko)
 * Clarify docs of use of jscs-browser.js (Oleg Gaidarenko)

## Version 1.5.6
 * Correct prebublish script (Oleg Gaidarenko)

## Version 1.5.5
 * Add allowUrlComments to yandex preset (ikokostya)
 * Improve requireMultipleVarDecl rule (Oleg Gaidarenko)
 * Improve fileExtension option (Oleg Gaidarenko)
 * Perform file check by direct reference (Oleg Gaidarenko)
 * Comma not on the same line with the first operand (Oleg Gaidarenko)
 * Simplify doc instruction a bit (Oleg Gaidarenko)
 * Generate "jscs-browser.js" only during publishing (Oleg Gaidarenko)
 * Fix tests for requireSpaceBeforeBinaryOperators (lemmy)

## Version 1.5.4
 * Fix crash caused by multiline case statements that fall through for validateIndentation rule (Mike Sherov)

## Version 1.5.3
 * Add missing rules in jQuery preset (Oleg Gaidarenko)
 * Exclude comma operator from requireSpaceBeforeBinaryOperators rule (Oleg Gaidarenko)
 * Ignore ios instruments style imports (@sebv)
 * Various doc fixes (Christian Vuerings, Timo Tijhof, Oleg Gaidarenko)

## Version 1.5.2
 * Improve binary rule (Oleg Gaidarenko)
 * Fix recursive descend, #445 (Oleg Gaidarenko)

## Version 1.5.1
 * Version bump to address incorrectly published docs (Mike Sherov)

## Version 1.5.0
 * Sticked Operators Rules: Deprecate in favor of more specific rules (Mike Sherov)
 * Update google preset (Oleg Gaidarenko)
 * Update jQuery preset (Mike Sherov)
 * Implement wikimedia preset (Timo Tijhof)
 * Impelement yandex preset (Alexander Tarmolov)
 * Implement fileExtensions option (Joel Brandt)
 * Implement requireYodaConditions rule (Oleg Gaidarenko)
 * Disallow Space After Line Comment: New Rule (Ben Bernard)
 * Require Space After Line Comment: New Rule (Ben Bernard)
 * Implement requireSpacesInsideParentheses (Mikko Rantanen)
 * MaximumLineLength: add ignoreUrlComments option which ignore comments with long urls. (Mike Sherov)
 * requireCamelCaseOrUpperCaseIdentifiers: add option to ignore object properties. (Mike Sherov)
 * MaximumLineLength: provide relaxing option for comments and/or regular expression literals. (Mike Sherov)
 * disallowPaddingNewlinesInBlocks: Count comments as valid tokens. (Joshua Koo)
 * Add new option to maximumLineLength rule (Oleg Gaidarenko)
 * Function expressions ignore getters and setters (Ruben Tytgat)
 * Add "true" as a possible value for binary/unary rules (Oleg Gaidarenko)
 * Improve disallowSpacesInsideObjectBrackets (Oleg Gaidarenko)
 * Improve disallowSpacesInsideArrayBrackets (Oleg Gaidarenko)
 * Improve disallowSpacesInsideArrayBrackets rule (Oleg Gaidarenko)
 * Improve disallowSpacesInsideObjectBrackets rule (Oleg Gaidarenko)
 * Improve disallowQuotedKeysInObjects rule (Oleg Gaidarenko)
 * Improve requireSpacesInsideObjectBrackets rule (Oleg Gaidarenko)
 * Improve handling comments for *SpaceAfterKeywords (Oleg Gaidarenko)
 * Improve requireOperatorBeforeLineBreak (Oleg Gaidarenko)
 * Improve defintions of operators in utils module (Oleg Gaidarenko)
 * Improve requireSpaceBeforePostfixUnaryOperators (Oleg Gaidarenko)
 * Improve disallowSpaceBeforePostfixUnaryOperators (Oleg Gaidarenko)
 * Improve requireSpaceAfterPrefixUnaryOperators (Oleg Gaidarenko)
 * Improve disallowSpaceAfterPrefixUnaryOperators (Oleg Gaidarenko)
 * Improve disallowSpaceAfterBinaryOperators rule (Oleg Gaidarenko)
 * Improve requireSpaceBeforeBinaryOperators rule (Oleg Gaidarenko)
 * Improve disallowSpaceBeforeBinaryOperators rule (Oleg Gaidarenko)
 * Improve requireSpaceAfterBinaryOperators rule (Oleg Gaidarenko)
 * Improve requireOperatorBeforeLineBreak rule (Oleg Gaidarenko)
 * Improve requireSpaceAfterPrefixUnaryOperators rule (Oleg Gaidarenko)
 * Improve requireOperatorBeforeLineBreak rule (Oleg Gaidarenko)
 * Differentiate errors for requireSpaceAfterKeywords (Oleg Gaidarenko)
 * Modify lint options of jshint and jscs (Oleg Gaidarenko)
 * Test Cleanup (Oleg Gaidarenko)
 * Throw error if specified preset does not exist (Oleg Gaidarenko)
 * utils: Remove duplicate '+=' from binaryOperators (Timo Tijhof)
 * Various readme fixes (Syoichi Tsuyuhara)
 * Provide friendly message for corrupted config (Oleg Gaidarenko)
 * Use new Vow API (Jordan Harband)
 * Update Mocha (Jordan Harband)
 * Update dependencies (Jordan Harband)
 * Various improvements to the utils module (Oleg Gaidarenko)
 * "null" must be a quoted key in IE 6-8 (Jordan Harband)
 * Change signature of findOperatorByRangeStart (Oleg Gaidarenko)
 * Add isTokenParenthesis method to token helper (Oleg Gaidarenko)
 * Improve getTokenByRangeStart method (Oleg Gaidarenko)
 * Correct docs for requireSpacesInsideParentheses (Oleg Gaidarenko)
 * readme: Clean up assignment operators (Timo Tijhof)

## Version 1.4.5
 * Hotfix: Fix binary rules for "," and "=" operators (@markelog)

## Version 1.4.4
 * Improve `requireSpaceAfterBinaryOperators` rule (@markelog)
 * Improve `disallowSpaceAfterBinaryOperators` rule (@markelog)
 * Improve `requireSpaceBeforeBinaryOperators` rule (@markelog)
 * Improve `disallowSpaceBeforeBinaryOperators` rule (@markelog)
 * Update google preset (@markelog)
 * Fixes `requirePaddingNewlinesInBlocks`: support multi-line padding (@zz85)
 * Update error message when no config is found (@mikesherov)
 * Rule `requireSpacesInConditionalExpression` (@mikesherov)
 * Rule `disallowSpacesInConditionalExpression` (@mikesherov)
 * Fixes for `validateIndentation` rule: fix more weird onevar constructs and associated indentation rules. (@mikesherov)
 * Fixes for `validateIndentation` rule: fix bug when IfStatement test contains a BlockStatement

## Version 1.4.3:
 * Presets folder was missing in the package (@mdevils).

## Version 1.4.2:
 * Rule `requireSpaceAfterKeywords`: do not fail on linebreaks (@mdevils).

## Version 1.4.1:
 * Rule `disallowPaddingNewlinesInBlocks`: check for comments in the whitespace. Fixes #347 (@mikesherov).
 * Introduce extensions section in README (@zxqfox)
 * Fixes for `validateIndentation` rule: properly validate finally clauses. Fixes #311 (@mikesherov).
 * Fixes for `validateIndentation` rule: tests for holes in array and more complex temporary fix for it (@zxqfox).
 * Fixes for `validateIndentation` rule: allow for extra indents when first variable
   in a declaration is multi-line (@mikesherov).
 * Fixes for `validateIndentation` rule: prevent false positive when array elements are
   on same line as array opener, but array is not single line. Fixes #353 (@mikesherov)
 * Restructuration of lib/test files (@markelog)

## Version 1.4.0:
 * Dropped `node.js` 0.8 support.
 * Update all dependencies to their latest versions except `vow`/`vow-fs` (@XhmikosR).
 * Add dependency status badges (@XhmikosR).
 * Advanced search for the configuration files (@markelog).
 * Improve `requireSpaceAfterKeywords` rule: trigger error if there is more then two spaces (@markelog).
 * Rule `spaceAfterKeywords`: fix up funarg issue (@markelog).
 * Make `requireMultipleVarDecl` rule more like onevar (@markelog).
 * Allow comments in parentheses for rule `disallowSpacesInsideParentheses` (@Famlam).
 * Extract own settings into google preset (@jzaefferer).
 * Rule `disallowTrailingComma` (@rxin).
 * Rule `requireTrailingComma` (@rxin).
 * Rule `disallowSpaceBeforeBlockStatements` (@rxin).
 * Rule `requireSpaceBeforeBlockStatements` (@rxin).
 * Rule `requireBlocksOnNewline` (@mikesherov).
 * Rule `requirePaddingNewlinesInBlock` (@mikesherov).
 * Rule `disallowPaddingNewlinesInBlock` (@mikesherov).

## Version 1.3.0:
 * New JSCS config format: `.jscsrc`. JSON-file with comments.
 * Rule `requireBlocksOnNewline` (@Famlam).
 * Rule `requireSpacesInAnonymousFunctionExpression` (@jamesallardice).
 * Rule `disallowSpacesInAnonymousFunctionExpression` (@jamesallardice).
 * Rule `requireSpacesInNamedFunctionExpression` (@jamesallardice).
 * Rule `disallowSpacesInNamedFunctionExpression` (@jamesallardice).
 * Custom path to reporter (@Adeel).
 * Option `escape` for rule `validateQuote` (@mikesherov).
 * Fixed `validateIndentation` rule (@mikesherov).
 * Fixed `excludeFiles` option (@markelog).
 * CLI/Reporter fixes (@markelog, @am11).
 * Documentation fixes (@tenorok).
 * Minor tweaks (@XhmikosR).

## Version 1.2.4:
 * Fixed typos.
 * Fixed `validateIndentation` rule.
 * Sorting errors.

## Version 1.2.3:
 * New reporter: `inline` (@clochix).
 * Fixed for rule `requireDotNotation` (@ikokostya).

## Version 1.2.2:
 * Fixed case with number for `requireDotNotation` rule (@andrewblond).

## Version 1.2.1:
 * Fix in error message for rule `maximumLineLength` (@pdehaan).

## Version 1.2.0:
 * Rule `requireCommaBeforeLineBreak` (@mikesherov).
 * Rule `disallowCommaBeforeLineBreak` (@mikesherov).
 * Rule `requireDotNotation` (@mikesherov).
 * Rule `requireCamelCaseOrUpperCaseIdentifiers` (@mikesherov).
 * Rule `disallowEmptyBlocks` (@mikesherov).
 * Rule `validateQuoteMarks` (@mikesherov).
 * Rule `requireParenthesesAroundIIFE` (@mikesherov).
 * Rule `requireOperatorBeforeLineBreak` (@mikesherov).
 * Rule `requireCapitalizedConstructors` (@mikesherov).
 * Rule `disallowDanglingUnderscores` (@mikesherov).
 * Rule `disallowTrailingWhitespace` (@mikesherov).
 * Сurly brace checking for 'case' and 'default' statements (@mikesherov).
 * Rule `maximumLineLength` (@mikesherov).
 * Rule `disallowMixedSpacesAndTabs` (@mikesherov).
 * Rule `validateIndentation` (@mikesherov).
 * README: Reformat to use headings (@nschonni).
 * ES3 future reserved words added to tokenIsReservedWord() (@maxatwork).
 * Fixes for: requireSpaceBeforePostfixUnaryOperators, requireSpaceAfterPrefixUnaryOperators,
   disallowSpaceBeforePostfixUnaryOperators, disallowSpaceAfterPrefixUnaryOperators (@mdevils).
 * Rule `disallowMultipleLineStrings` (@mikesherov).

## Version 1.0.15:
 * junit reporter (@markelog).

## Version 1.0.14:
 * Option `additionalRules` (@markelog).
 * disallowQuotedKeysInObjects: Exclusion array (@nschonni).

## Version 1.0.13:
 * Option `validateLineBreaks` (@twoRoger).

## Version 1.0.12:
 * Fixes for jsdoc params.

## Version 1.0.11:
 * Prefix unary rules: `disallowSpaceAfterPrefixUnaryOperators`, `requireSpaceAfterPrefixUnaryOperators` (@mishaberezin).
 * Postfix unary rules: `disallowSpaceBeforePostfixUnaryOperators`, `requireSpaceBeforePostfixUnaryOperators` (@mishaberezin).

## Version 1.0.10:
 * Reporter support — `console`, `text`, `checkstyle`.

## Version 1.0.9:
 * Browser-compatible version.
 * Fix for `disallowMultipleLineBreaks` option to report only once per each sequence of line breaks.
 * Fix for `disallowMultipleLineBreaks` option to work properly when CRLF line break is used.

## Version 1.0.8:
 * Fixes for `safeContextKeyword`.

## Version 1.0.7:
 * Disallow spaces inside parentheses (@ignovak).

## Version 1.0.6:
 * Convert tabs into spaces (@markelog).
 * Report illegal space between nested closing curly braces (@twoRoger).
 * Use absolute path to config when specified (@vtambourine).
 * safeContextKeyword option to check "var that = this" expressions (@doochik).

## Version 1.0.4-1.0.5:
 * Fixed mistype `disallowMulipleVarDecl` -> `disallowMultipleVarDecl`.
 * Fixed error for invalid symlink checking.

## Version 1.0.3:
 * Changed behaviour for `disallowMultipleVarDecl` options. Now accepts multiple var decl in `for` decl.

## Version 1.0.2:
 * Option `requireSpacesInsideArrayBrackets` (@mishanga).

## Version 1.0.1:
 * Not reporting about extra quotes for zero-starting numbers in `disallowQuotedKeysInObjects`.

## Version 1.0.0:
 * Camel-case configuration options.
 * Option `requireAlignedObjectValues`.
 * Option `requireSpaceAfterObjectKeys`.
 * JSDoc for core functions and classes.
 * Fix error position for disallowSpacesInsideObjectBrackets and disallowSpacesInsideArrayBrackets.


## Version 0.0.12:
 * Fix in `disallowSpaceAfterObjectKeys` location reporting.

## Version 0.0.11:
 * Option `disallowSpaceAfterObjectKeys`.
 * Option `disallowSpacesInsideArrayBrackets`.
 * Do not automatically exclude hidden files.

## Version 0.0.10:
 * Fix in `disallowQuotedKeysInObjects`.

## Version 0.0.9:
 * Fix in `disallowQuotedKeysInObjects`.

## Version 0.0.8:
 * Fix in `requireSpacesInsideObjectBrackets`.
 * Option `disallowQuotedKeysInObjects`.

## Version 0.0.7:
 * Option `requireSpacesInsideObjectBrackets`.
 * Option `disallowSpacesInsideObjectBrackets`.

## Version 0.0.6:
 * Fixes incorrent checkPath behavior.

## Version 0.0.5:
 * .jshintrc config.
 * Error message format fixes.

## Version 0.0.4:
 * Option `disallowYodaConditions`.
 * Option `requireMultipleVarDecl`.

## Version 0.0.3:
 * Option `excludeFiles`, which accepts patterns.

## Version 0.0.2:
 * Link to parent nodes.

## Version 0.0.1:
 * Initial implementation.
