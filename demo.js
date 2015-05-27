var Fs = require('fire-fs');
var Path = require('fire-path');

global.__app = {
    path: __dirname,

    initCommander: function ( commander ) {
        // TODO:
    },

    init: function ( options ) {
        // initialize ./.settings
        var settingsPath = Path.join(Editor.cwd, '.settings');
        if ( !Fs.existsSync(settingsPath) ) {
            Fs.makeTreeSync(settingsPath);
        }
        Editor.registerProfilePath( 'local', settingsPath );

        // TODO: load your profile, and disable packages here

        Editor.registerPackagePath( Editor.url('app://demo/') );
    },

    run: function () {
        // create main window
        var mainWin = new Editor.Window('main', {
            'title': 'Editor Framework',
            'min-width': 800,
            'min-height': 600,
            'show': false,
            'resizable': true,
        });
        Editor.mainWindow = mainWin;

        // restore window size and position
        mainWin.restorePositionAndSize();

        // load and show main window
        mainWin.show();

        // page-level test case
        mainWin.load( 'app://demo/index.html' );

        // open dev tools if needed
        if ( Editor.showDevtools ) {
            mainWin.openDevTools({
                detach: true
            });
        }
        mainWin.focus();
    },

    load: function () {
        // TODO
    },

    unload: function () {
        // TODO
    },

    // TODO: try to create a worker
    // 'app:worker': function () {
    //     var BrowserWindow = require('browser-window');
    //     var workerWin = new BrowserWindow({
    //         show: false,
    //     });

    //     var Url = require('fire-url');
    //     var url = Url.format( {
    //         protocol: 'file',
    //         pathname: Editor.url('editor-framework://static/worker.html' ),
    //         slashes: true,
    //     } );
    //     workerWin.loadUrl(url);
    // },

    'app:tester': function () {
        var BrowserWindow = require('browser-window');
        Editor.testerWin = new BrowserWindow({
            show: true,
        });
        var Url = require('fire-url');
        var url = Url.format( {
            protocol: 'file',
            pathname: Editor.url('editor-framework://static/tester.html' ),
            slashes: true,
            query: { url: 'packages://console/test/console.html' },
        } );
        Editor.testerWin.loadUrl(url);
    },
};

require('./init');

