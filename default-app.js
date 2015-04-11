// init your app

// exports
module.exports = {
    run: function ( options ) {
        // create main window
        var mainWin = new Editor.Window('main', {
            // atom-window options
            'title': 'Editor Framework',
            'min-width': 800,
            'min-height': 600,
            'show': false,
            'resizable': true,

            // editor-window options
            'panel-window': true,
        });
        Editor.mainWindow = mainWin;


        // load and show main window
        mainWin.show();
        mainWin.load( './static/window.html' );
    }
};
