var gulp = require('gulp');
var shell = require('gulp-shell');
var markdownPage = require('./tools/markdown-page');
var teamPage = require('./tools/team-page');
var rulesPage = require('./tools/rules-page');
var addJsDoc = require('./tools/add-jsdoc');

gulp.task('build', ['about', 'overview', 'contributing', 'rules', 'team']);

gulp.task('about', function() {
    return gulp.src('../README.md')
        .pipe(markdownPage('src/about.jade', 'index.html', {title: 'About'}))
        .pipe(gulp.dest('result'));
});

gulp.task('overview', function() {
    return gulp.src('../OVERVIEW.md')
        .pipe(markdownPage('src/overview.jade', 'overview.html', {title: 'Overview'}))
        .pipe(gulp.dest('result'));
});

gulp.task('contributing', function() {
    return gulp.src('../CONTRIBUTING.md')
        .pipe(markdownPage('src/contributing.jade', 'contributing.html', {title: 'Contributing'}))
        .pipe(gulp.dest('result'));
});

gulp.task('team', function() {
    return gulp.src('../package.json')
        .pipe(teamPage('src/team.jade', 'team.html', {title: 'Team'}))
        .pipe(gulp.dest('result'));
});

gulp.task('rules', function() {
    return gulp.src('../lib/rules/*.js')
        .pipe(rulesPage('src/rules.jade', 'rules.html', {title: 'Rules'}))
        .pipe(gulp.dest('result'));
});

gulp.task('add-jsdoc', function() {
    return gulp.src('../lib/rules/*.js')
        .pipe(addJsDoc('../README.md'))
        .pipe(gulp.dest('rules'));
});

gulp.task('publish', ['build'], shell.task([
    'git fetch origin',
    'if [ -d publish ]; then rm -Rf ./publish; fi',
    'git clone git@github.com:jscs-dev/jscs-dev.github.io.git ./publish',
    'cd publish; git checkout master;',
    'cd publish; ls -a1 | grep -v "^.git$" | grep -v "^.$" | grep -v "^..$" | xargs rm -Rf',
    'cp -R result/* publish',
    'cd publish; git add -A;' +
    'git commit -m "Website update";' +
    'git push origin master',
    'echo; echo "Website was published at http://jscs.info/"'
]));

gulp.task('watch', ['build'], function() {
    gulp.watch(['src/**', '../README.md'], ['about']);
    gulp.watch(['src/**', '../OVERVIEW.md'], ['overview']);
    gulp.watch(['src/**', '../CONTRIBUTING.md'], ['contributing']);
    gulp.watch(['src/**', '../package.json'], ['team']);
    gulp.watch(['src/**', '../lib/rules/*.js'], ['rules']);
});
