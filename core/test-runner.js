// NOTE: This is test runner for editor-framework, it covers the test cases for developing editor-framework
// It is different than github.com/fireball-packages/tester, which is for package developers to test their pacakges.

var Ipc = require('ipc');
var Globby = require('globby');
var Path = require('fire-path');
var Fs = require('fire-fs');
var Chalk = require('chalk');

var Mocha = require('mocha');
var Chai = require('chai');

//
global.assert = Chai.assert;
global.expect = Chai.expect;

var Test = {};
Test.liveRun = function ( path ) {
    var SpawnSync = require('child_process').spawnSync;
    var App = require('app');
    var exePath = App.getPath('exe');

    if ( Fs.isDirSync(path) ) {
        var indexFile = Path.join(path, 'index.js');
        var files;

        if ( Fs.existsSync(indexFile) ) {
            var cache = require.cache;
            if ( cache[indexFile] ) {
                delete cache[indexFile];
            }

            files = require(indexFile);
            files.forEach(function ( file ) {
                Test.liveRun( file );
            });
        }
        else {
            Globby ( Path.join(path, '**/*.js'), function ( err, files ) {
                files.forEach(function (file) {
                    Test.liveRun( file );
                });
            });
        }
    }
    else {
        SpawnSync(exePath, ['./', '--test', path], {stdio: 'inherit'});
    }
};

Test.run = function ( path ) {
    console.log( '\n----------------------------------------\n' );
    console.log( Chalk.magenta( 'Start test (' + path + ')') );

    var stats = Fs.statSync(path);
    if ( !stats.isFile() ) {
        console.error('The path %s you provide is not a file', path);
        process.exit(0);
        return;
    }

    var mocha = new Mocha({
        ui: 'bdd',
    });
    mocha.addFile(path);

    mocha.run(function(failures){
        if ( failures === 0 )
            console.log( Chalk.green( 'Test passed (' + path + ')' ) );
        else
            console.log( Chalk.red( 'Test failed (' + path + ')') );
        process.exit(failures);
    });
};

module.exports = Test;
