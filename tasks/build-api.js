// general
var gulp = require('gulp');
var changed = require('gulp-changed');
var watch = require('gulp-watch');
var del = require('del');

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
var gulpfiles = ['**/gulpfile.js', '**/tasks/*.js'].concat(ignores);
var allfiles = [
    './init.js',
    './core/**/*.js',
    './page/**/*.js',
    './share/**/*.js'
].concat(ignores);

var paths = {
    'api-core': ['./init.js', './core/**/*.js', './share/**/*.js'].concat(ignores),
    'api-page': ['./init.js', './page/**/*.js', './share/**/*.js'].concat(ignores),
};

gulp.task('api-core', function (done) {
    var spawn = require('child_process').spawn;
    var p = spawn('npm', ['run', 'api-core'], {stdio: 'inherit'});
    p.on('close', function (code) {
        if ( code !== 0 ) {
            done( new Error('Failed to build api in core-level') );
            return;
        }
        done();
    });
});

gulp.task('api-page', function (done) {
    var spawn = require('child_process').spawn;
    var p = spawn('npm', ['run', 'api-page'], {stdio: 'inherit'});
    p.on('close', function (code) {
        if ( code !== 0 ) {
            done( new Error('Failed to build api in page-level') );
            return;
        }
        done();
    });
});

// clean
gulp.task('api-clean', function(cb) {
    del('./api/', cb);
});

function dowatch ( taskName ) {
    watch( paths[taskName], function ( file ) {
        if ( file.event !== 'unlink' ) {
            gulp.start(taskName);
        }
    }).on('error', function (e) {
        console.warn(e.message);
    });
}

gulp.task('api-watch', function() {
    for ( var name in paths ) {
        dowatch(name);
    }

    watch( allfiles, {
        events: ['unlink', 'unlinkDir', 'error']
    }, function ( file ) {
        if ( file.event === 'unlink' || file.event === 'unlinkDir' ) {
            var relative = file.relative;
            var destFile = Path.join( dest, relative );
            del(destFile, function (err) {
                if ( err ) {
                    console.log( Chalk.yellow(err.message) );
                    return;
                }
                console.log( Chalk.green(destFile + ' deleted!') );
            });
        }
    }).on('error', function (e) {
        console.warn(e.message);
    });
});
