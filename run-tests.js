var Path = require('path');
var Fs = require('fs');
var SpawnSync = require('child_process').spawnSync;

var exePath = '';
if ( process.platform === 'darwin' ) {
    exePath = './bin/electron/Electron.app/Contents/MacOS/Electron';
}
else {
    exePath = './bin/electron/Electron.exe';
}

var files;
var indexFile = './test/index.js';

if ( Fs.existsSync(indexFile) ) {
    files = require(indexFile);
    files.forEach(function ( file ) {
        SpawnSync(exePath, ['./', '--test', file], {stdio: 'inherit'});
    });
}
else {
    Globby ( Path.join(path, '**/*.js'), function ( err, files ) {
        files.forEach(function (file) {
            SpawnSync(exePath, ['./', '--test', file], {stdio: 'inherit'});
        });
    });
}
