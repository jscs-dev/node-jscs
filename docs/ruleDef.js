exports.defineTags = function(dictionary) {
    dictionary.defineTag('rule', {
        onTagged: function(doclet, tag) {
            doclet.longname = tag.value;
            doclet.kind = 'rule';
        }
    });
};
