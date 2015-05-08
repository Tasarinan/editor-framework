var BrowserWindow = require('browser-window');
var Spawn = require('child_process').spawn;

var Debugger = {};
var dbgProcess;

Debugger.toggle = function () {
    if ( dbgProcess ) {
        Debugger.close();
    }
    else {
        Debugger.open();
    }
};

Debugger.open = function () {
    dbgProcess = Spawn('node-inspector', ['--debug-port=3030'], {stdio: 'inherit'});
    Editor.MainMenu.set( 'Developer/Debug Core', {
        checked: true
    });
    Editor.info('Visit http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=3030 to start debugging');

    // var debuggerWin = new BrowserWindow({
    //     'web-preferences': {
    //         'experimental-features': true,
    //         'experimental-canvas-features': true,
    //     }
    // });
    // var url = 'http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=3030';
    // debuggerWin.loadUrl(url);
    // debuggerWin.on ( 'closed', function () {
    //     dbgProcess.kill();
    //     Editor.info('debugger process closed');
    // });
};

Debugger.close = function () {
    if ( dbgProcess ) {
        dbgProcess.kill();
        dbgProcess = null;
    }
    Editor.MainMenu.set( 'Developer/Debug Core', {
        checked: false
    });
    Editor.info('core debugger closed');
};

module.exports = Debugger;
