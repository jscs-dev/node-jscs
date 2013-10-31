.PHONY: browser
browser:
	node_modules/.bin/browserify --standalone JscsStringChecker lib/string-checker.js -o jscs-browser.js
