var gulp = require('gulp');
var utils = require('./tasks/utils');

// require tasks
require('./tasks/download-shell');
require('./tasks/build');
require('./tasks/build-min');
require('./tasks/build-api');

gulp.task('update-config', function ( done ) {
    var Fs = require('fs');

    var appJson = JSON.parse(Fs.readFileSync('./package.json'));
    var frameworkJson = JSON.parse(Fs.readFileSync('./editor-framework/package.json'));

    utils.mixin( frameworkJson.dependencies, appJson.dependencies );
    utils.mixin( frameworkJson.devDependencies, appJson.devDependencies );

    Fs.writeFileSync('./package.json', JSON.stringify(frameworkJson, null, 2));

    done();
});

gulp.task('clean-all', ['clean', 'clean-min']);

