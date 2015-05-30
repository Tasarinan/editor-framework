// NOTE: This is test runner for editor-framework, it covers the test cases for developing editor-framework
// It is different than github.com/fireball-packages/tester, which is for package developers to test their pacakges.

var Ipc = require('ipc');
var Globby = require('globby');
var Path = require('path');

var Mocha = require('mocha');
var Chai = require('chai');

var Test = {};

Test.run = function ( path ) {
    var mocha = new Mocha({
        ui: 'bdd',
        reporter: 'list',
    });

    Globby ( Path.join(path, '**/*.js'), function ( err, paths ) {
        paths.forEach( function (file) {
            mocha.addFile(file);
        });

        mocha.run(function(failures){
            process.on('exit', function () {
                process.exit(failures);
            });
        });
    });
};

module.exports = Test;
