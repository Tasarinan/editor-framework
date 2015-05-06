var gulp = require('gulp');
var changed = require('gulp-changed');
var sequence = require('gulp-sequence');
var watch = require('gulp-watch');
var del = require('del');

var Path = require('path');
var Chalk = require('chalk');

var dest = 'bin/dev';
var ignores = [
    '!bin/**',
    '!bower_components/**',
    '!node_modules/**',
    '!docs/**',
];
var gulpfiles = ['**/gulpfile.js', '**/tasks/*.js'].concat(ignores);

var paths = {
    js: ['**/*.js','!**/gulpfile.js', '!**/tasks/*.js'].concat(ignores),
    html: ['**/*.html'].concat(ignores),
    css: ['**/*.css'].concat(ignores),
    json: ['**/*.json'].concat(ignores),
    image: ['**/*.{png,jpg}'].concat(ignores),
};

// js
gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(changed(dest))
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

// watch
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

    watch( ['**/*'].concat(ignores), {
        events: ['add', 'change', 'unlink', 'addDir', 'unlinkDir', 'error']
    }, function ( file ) {
        if ( file.event === 'unlink' || file.event === 'unlinkDir' ) {
            var destFile = Path.join( dest, file.relative );
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

// clean
gulp.task('clean', function(cb) {
    del(dest, cb);
});


//
gulp.task('build', sequence('clean', [
    'js',
    'html',
    'css',
    'json',
    'image',
]));
