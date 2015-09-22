var fs = require('fs');
var path = require('path');

var jsdocReadmePath = require.resolve('jscs-jsdoc/README.md');
var jsdocRulePath = path.resolve(__dirname, '../../lib/rules/jsdoc.js');

// grep '^## Rules' node_modules/jscs-jsdoc/README.md -A 5000 | grep '^## Browser Usage' -B 5000 |
// ghead -n -1 | head | awk '{ print " * "$0; }'
var jsdocReadmeContent = fs.readFileSync(jsdocReadmePath, { encoding: 'utf8' })
    .split('\n')
    .reduce(function(res, line) {
        if (/^## Rules/.test(line)) {
            res._afterRules = true;
        }
        if (/^## Browser Usage/.test(line)) {
            res._afterBrowserUsage = true;
        }
        if (res._afterRules && !res._afterBrowserUsage) {
            var indent = (new Array((line.match(/^\s*(-\s|\*\s)?/) || [''])[0].length + 1)).join(' ');
            while (line.length > 80) {
                var pos = line.slice(0, 80).lastIndexOf(' ');
                if (pos === -1) {
                    break;
                }
                var sub = line.slice(0, pos);

                // move paren to the next line
                var m = sub.match(/((^|\s)[\[\(]\w+)+$/);
                if (m) {
                    if (m.index === 0) {
                        break;
                    } else {
                        sub = sub.slice(0, m.index);
                        pos = m.index;
                    }
                }
                if ((sub.length + line.slice(pos + 1).length) < 90) {
                    break;
                }

                line = indent + line.slice(pos + 1);
                res.push(sub);
            }
            res.push(line);
        }
        return res;
    }, [
        'Validate jsdoc comments',
        '',
        '## Usage',
        '',
        '```json',
        '{',
        '    "jsDoc": {',
        '        "checkAnnotations": "closurecompiler",',
        '        "checkTypes": "strictNativeCase",',
        '        "enforceExistence": "exceptExports"',
        '        ...',
        '    }',
        '}',
        '```',
        ''
    ])
    .map(function(v) {
        return (' * ' + v)
            .replace(/\*\//, '*\\/')
            .replace(/\s$/, '');
    });

fs.writeFileSync(jsdocRulePath, [
        '/**',
        jsdocReadmeContent.join('\n'),
        ' */',
        'module.exports = require(\'jscs-jsdoc/lib/rules/validate-jsdoc\');',
        ''
    ]
    .join('\n'));
