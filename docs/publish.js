/*global env: true */
'use strict';

var template = require('jsdoc/template'),
    fs = require('jsdoc/fs'),
    path = require('jsdoc/path'),
    helper = require('jsdoc/util/templateHelper'),
    data,
    view,
    outdir = env.opts.destination;

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
 */
exports.publish = function(taffyData, opts) {
    function linkto(longname, current) {
        var link = path.join(outdir, helper.longnameToUrl[longname]),
            relative = linkToFile(link, current);
        return relative ? relative + '/' : '';
    }

    function linkToFile(file, current) {
        return path.relative(current, file);
    }

    function generate(data, template, filename, resolveLinks) {
        resolveLinks = resolveLinks !== false;

        var outpath = path.join(outdir, filename),
            docData = {
                title: env.conf.templates.title,
                rules: rules.get(),
                outdir: outdir,
                filepath: path.dirname(outpath),
                data: data
            },
            html = view.render(template, docData);

        if (resolveLinks) {
            html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
        }

        fs.mkPath(path.dirname(outpath));
        fs.writeFileSync(outpath, html, 'utf8');
    }

    data = taffyData;

    var conf = env.conf.templates || {};
    conf['default'] = conf['default'] || {};

    var templatePath = opts.template;
    view = new template.Template(templatePath + '/tmpl');

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    var indexUrl = helper.getUniqueFilename('index');

    // set up templating
    view.layout = conf['default'].layoutFile ?
        path.getResourcePath(path.dirname(conf['default'].layoutFile),
            path.basename(conf['default'].layoutFile) ) :
        'layout.tmpl';

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    // copy the template's static files to outdir
    var fromDir = path.join(templatePath, 'static');
    var staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(function(fileName) {
        var toDir = fs.toDir( fileName.replace(fromDir, outdir) );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    var rules = data({kind: 'rule'});

    view.rulesPath = 'rules/';
    view.linkto = linkto;
    view.linkToFile = linkToFile;

    helper.registerLink('index', indexUrl);
    rules.each(function(rule) {
        var code = rule.meta.code;
        if (code.node.type === 'ObjectExpression') {
            var getNameFunction = code.node.properties.filter(function(prop) {
                return prop.key.name === 'getOptionName';
            })[0];
            if (getNameFunction) {
                rule.optionName = getNameFunction.value.body.body[0].argument.value;
            } else {
                console.warn('Rule "' + rule.longname + '" doesn\'t have a getOptionName function');
            }
        }
        rule.examples = rule.examples ? rule.examples.map(function(example) {
            var caption, code;
            if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                caption = RegExp.$1;
                code    = RegExp.$3;
            }
            return {
                caption: caption || '',
                code: code || example
            };
        }) : [];
        rule.meta.url = view.rulesPath + path.basename(rule.meta.filename, '.js') + '/';
        helper.registerLink(rule.longname, rule.meta.url);
    });

    helper.registerLink('home', '/');
    helper.registerLink('rules-list', view.rulesPath);

    //readme file
    generate({readme: opts.readme}, 'home.tmpl', indexUrl);
    //rules list
    generate({}, 'rules-list.tmpl', view.rulesPath + 'index.html');

    rules.each(function(rule) {
        generate({rule: rule}, 'rule.tmpl', rule.meta.url + 'index.html');
    });
};
