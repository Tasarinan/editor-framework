// init your app
var Fs = require('fire-fs');
var Path = require('fire-path');

// exports
module.exports = {
    init: function ( options ) {
        // initialize ./test/.settings
        var settingsPath = Path.join(Editor.cwd, 'test', '.settings');
        if ( !Fs.existsSync(settingsPath) ) {
            Fs.makeTreeSync(settingsPath);
        }
        Editor.registerProfilePath( 'local', settingsPath );

        // TODO: load your profile, and disable packages here
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
        // mainWin.load( 'editor://test/lifecycle/lifecycle.html' );
        mainWin.load( 'editor://test/import/test-import.html' );
        // mainWin.load( 'editor://test/dockable/dockable.html' );

        // open dev tools if needed
        if ( Editor.showDevtools ) {
            mainWin.openDevTools();
        }
        mainWin.focus();
    }
};
