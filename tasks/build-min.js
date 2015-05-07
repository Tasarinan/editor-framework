// general
var gulp = require('gulp');
var sequence = require('gulp-sequence');
var del = require('del');

// modules
var Fs = require('fs');
var Path = require('path');

// special tasks
var browserify = require('browserify');
var vulcanize = require('gulp-vulcanize');

// ==============================
// paths
// ==============================

var src = 'bin/dev';
var dest = 'bin/min';

var paths = {
    'core-js': [
        src + '/init.js',
        src + '/app.js',
        src + '/core/**/*.js'
    ],
};

// ==============================
// tasks
// ==============================

// js
gulp.task('js-min', function () {
    // DISABLE
    // // set up the browserify instance on a task basis
    // var b = browserify({
    //     entries: './bin/dev/page/editor-init.js',
    //     debug: true,
    //     externalRequireName: 'Editor.require',
    // });
    // return b.bundle()
    //     // .pipe(source('./init.js'))
    //     // .pipe(buffer())
    //     // .pipe(sourcemaps.init({loadMaps: true}))
    //     // Add transformation tasks to the pipeline here.
    //     // .pipe(uglify()).on('error', gutil.log)
    //     // .pipe(sourcemaps.write('./'))
    //     .pipe(gulp.dest(dest));
    // done();

    return gulp.src(paths['core-js'])
        .pipe(gulp.dest(dest))
        ;
});

// html
gulp.task('html-min', function () {
    // DISABLE
    // vulcanize.setOptions({
    //     abspath: Path.resolve('./bin/dev/page/ui/'),
    //     excludes: [
    //     ],
    //     stripExcludes: true,
    //     inlineScripts: true
    // });
    // vulcanize.process('ui.html', function ( err, inlinedHtml ) {
    //     console.log(err);
    //     console.log(inlinedHtml);
    //     Fs.writeFileSync( Path.join(dest,'page/ui/ui.html'), inlinedHtml, 'utf8');
    //     done();
    // });

    return gulp.src('bin/dev/page/ui/ui.html')
        .pipe(vulcanize({
            dest: 'bin/min/page/ui/',
            inline: true,
            strip: true
        }))
        // .pipe(htmlmin({
        //     removeComments: true,
        //     collapseWhitespace: true
        // }))
        .pipe(gulp.dest('bin/min/page/ui/'))
        ;
});

// clean-min
gulp.task('clean-min', function(cb) {
    del(dest, cb);
});

// build-min
gulp.task('build-min', sequence('clean-min',
    'js-min',
    'html-min'
));
