var fs = require('fs');
var regenerate = require('regenerate');

['L', 'Ll', 'Lu'].forEach(function(category) {
    var codePoints = require(
        'unicode-7.0.0/categories/' + category + '/code-points'
    );
    var pattern = regenerate(codePoints).toString();
    var source = 'module.exports = /' + pattern + '/;\n';
    fs.writeFileSync('./patterns/' + category + '.js', source);
});
