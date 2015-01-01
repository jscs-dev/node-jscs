var markedToc = require('marked-toc');
var marked = require('marked');
var highlightJs = require('highlight.js');

marked.setOptions({
    highlight: function(code, lang) {
        return lang ? highlightJs.highlight(lang, code).value : code;
    }
});

function processMarkdown(markdown, callback) {
    var toc = '\n<!--start_toc-->\n\n' + markedToc(markdown, {maxDepth: 1}) + '\n\n<!--end_toc-->\n';
    var html = marked(markdown.replace('<!-- toc -->', toc), callback);
    html = html.replace('<!--start_toc-->', '<div class="toc"><div class="toc-header">Table of contents:</div>');
    html = html.replace('<!--end_toc-->', '</div>');
    return html;
}

module.exports = processMarkdown;
