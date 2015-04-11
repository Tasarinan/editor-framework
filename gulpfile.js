/**
 * Tasks downloading fire-shell and native modules
 * Created by nantas on 15/2/28.
 */

var gulp = require('gulp');
var updateAtomShell = require('gulp-download-atom-shell');
var updateFireShell = require('gulp-download-fire-shell');
var shell = require('gulp-shell');
var Path = require('path');
var Fs = require('fs');

var pjson = JSON.parse(Fs.readFileSync('./package.json'));
var fireShellVer = pjson['fire-shell-version'];
var atomShellVer = pjson['atom-shell-version'];

/////////////////////////////////////////////////////
// inits
/////////////////////////////////////////////////////

if ( fireShellVer === null || fireShellVer === undefined ) {
  console.error( 'Can not read fire-shell-version from package.json' );
  return;
}

if ( atomShellVer === null || atomShellVer === undefined ) {
  console.error( 'Can not read atom-shell-version from package.json' );
  return;
}

/////////////////////////////////////////////////////
// downloads
/////////////////////////////////////////////////////

gulp.task('update-atom-shell', function(cb) {
  updateAtomShell({
    version: atomShellVer,
    outputDir: 'bin/atom-shell'
  }, cb);
});

gulp.task('update-fire-shell', function(cb) {
  updateFireShell.downloadFireShell({
    version: fireShellVer,
    outputDir: 'bin/fire-shell'
  }, cb);
});

gulp.task('update-fire-shell-china', function(cb) {
  updateFireShell.downloadFireShell({
    version: fireShellVer,
    outputDir: 'bin/fire-shell',
    chinaMirror: true
  }, cb);
});

gulp.task('prebuild-native-module', shell.task(['node config.js true']));

gulp.task('update-atom-native-module', ['prebuild-native-module'], function(cb) {
  var setcmd = process.platform === 'win32' ? 'set' : 'export';
  var stream = shell([
    'apm install'
  ], {
    cwd: 'bin',
    env: {
      ATOM_NODE_VERSION: atomShellVer
    }
  });
  stream.write(process.stdout);
  stream.end();
  stream.on('finish', cb);
});

gulp.task('update-fire-native-module', function(cb) {
  var nativeModules = require('../../src/main/package.json')['native-modules'];
  updateFireShell.downloadNativeModules({
    version: fireShellVer,
    outputDir: Path.join('bin','node_modules'),
    nativeModules: nativeModules,
    isFireShell: true
  }, cb);
});

gulp.task('update-fire-native-module-china', function(cb) {
  var nativeModules = require('../../src/main/package.json')['native-modules'];
  updateFireShell.downloadNativeModules({
    version: fireShellVer,
    outputDir: Path.join('bin','node_modules'),
    nativeModules: nativeModules,
    isFireShell: true,
    chinaMirror: true
  }, cb);
});

gulp.task('clear-cached-downloads', function(cb) {
  updateFireShell.clearCachedDownloads({
    version: fireShellVer
  }, cb);
});

gulp.task('copy-fire-shell', ['del-dist'], function(cb) {
  updateFireShell.downloadFireShell({
    version: fireShellVer,
    outputDir: 'dist/',
    chinaMirror: true
  }, cb);
});
