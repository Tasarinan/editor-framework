// general
var gulp = require('gulp');
var changed = require('gulp-changed');
var sequence = require('gulp-sequence');
var watch = require('gulp-watch');
var del = require('del');

// special tasks
var stylus = require('gulp-stylus');
var jshint = require('gulp-jshint');

// modules
var Path = require('path');
var Chalk = require('chalk');

// ==============================
// paths
// ==============================

var dest = 'bin/dev';
var ignores = [
    '!bin/**',
    '!bower_components/**',
    '!node_modules/**',
    '!docs/**',
];
var allfiles = ['**/*'].concat(ignores);
var gulpfiles = ['**/gulpfile.js', '**/tasks/*.js'].concat(ignores);

var paths = {
    js: ['**/*.js','!**/gulpfile.js', '!**/tasks/*.js'].concat(ignores),
    html: ['**/*.html'].concat(ignores),
    css: ['**/*.css'].concat(ignores),
    styl: ['**/*.styl'].concat(ignores),
    json: ['**/*.json'].concat(ignores),
    image: ['**/*.{png,jpg}'].concat(ignores),
};
var extnameMappings = {
    '.styl': '.css',
};

// ==============================
// tasks
// ==============================

// js
gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(changed(dest))
        .pipe(jshint({
            multistr: true,
            smarttabs: false,
            loopfunc: true,
            esnext: true,
        }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(gulp.dest(dest));
});

// html
gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
});

// css
gulp.task('css', function () {
    return gulp.src(paths.css)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
});

// styl
gulp.task('styl', function() {
    return gulp.src(paths.styl)
    .pipe(changed(dest))
    .pipe(stylus({
        compress: false,
        include: 'src'
    }))
    .pipe(gulp.dest(dest));
});

// json
gulp.task('json', function () {
    return gulp.src(paths.json)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
});

// images
gulp.task('image', function () {
    return gulp.src(paths.image)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
});

// clean
gulp.task('clean', function(cb) {
    del(dest, cb);
});

// build
gulp.task('build', sequence('clean',
    'js',
    'html',
    [ 'css', 'styl' ],
    'json',
    'image'
));

// ==============================
// watch
// ==============================

function dowatch ( taskName ) {
    watch( paths[taskName], function ( file ) {
        if ( file.event !== 'unlink' ) {
            gulp.start(taskName);
        }
    }).on('error', function (e) {
        console.warn(e.message);
    });
    // DISABLE: create or rename directory will cause uncatchable exception
    // var watcher = gulp.watch( paths[taskName], [taskName]);
    // watcher
    // .on('error', function (err) {
    //     console.log(err);
    // })
    // .on('change', function (event) {
    //     // if a file is deleted
    //     if (event.type === 'deleted') {
    //         var destFile = Path.resolve( dest, Path.relative( process.cwd(), event.path ) );
    //         del.sync(destFile);
    //         console.log( '%s deleted!', destFile);
    //     }
    // })
    // ;
}
gulp.task('deep-watch', function() {
    for ( var name in paths ) {
        dowatch(name);
    }

    watch( allfiles, {
        events: ['unlink', 'unlinkDir', 'error']
    }, function ( file ) {
        if ( file.event === 'unlink' || file.event === 'unlinkDir' ) {
            var extname = Path.extname(file.relative);
            var destExtname = extnameMappings[extname];

            var relative = file.relative;
            if ( destExtname ) {
                var basename = Path.basename(file.relative,extname);
                relative = Path.join( Path.dirname(file.relative), basename + destExtname );
            }

            var destFile = Path.join( dest, relative );
            del(destFile, function (err) {
                if ( err ) {
                    console.log( Chalk.yellow(err.message) );
                    return;
                }
                console.log( Chalk.green(destFile + ' deleted!') );
            });
        }
        // DISABLE: can not detect new folder that have task files inside it.
        // else {
        //     if ( !file.stat.isDirectory() ) {
        //         var extname = Path.extname(file.path).substring(1);
        //         if ( paths[extname] ) {
        //             gulp.start(extname);
        //         }
        //     }
        // }
    }).on('error', function (e) {
        console.warn(e.message);
    });
});

gulp.task('watch', function() {
    // reload if gulpfile changed
    var p;
    function restart () {
        if ( p ) {
            p.kill();
            console.log( Chalk.yellow.bold('gulpfile changed, deep-watch restart!') );
        }
        var spawn = require('child_process').spawn;
        p = spawn('gulp', ['deep-watch'], {stdio: 'inherit'});
    }
    watch( gulpfiles, restart ).on('error', function (e) {
        console.log( Chalk.red(e.message) );
    });
    restart();
});
