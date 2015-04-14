//
try {
    // init document events

    // prevent default drag
    document.addEventListener( "dragstart", function (event) {
        event.preventDefault();
    } );
    document.addEventListener( "drop", function (event) {
        event.preventDefault();
    } );
    document.addEventListener( "dragover", function (event) {
        event.preventDefault();
    } );

    // prevent contextmenu
    document.addEventListener( "contextmenu", function (event) {
        event.preventDefault();
        event.stopPropagation();
    } );

    // prevent go back
    document.addEventListener( "keydown", function (event) {
        if ( event.keyCode === 8 ) {
            if ( event.target === document.body ) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    } );

    window.onload = function () {
        // NOTE: this will prevent mac touchpad scroll the body
        document.body.onscroll = function ( event ) {
            document.body.scrollLeft = 0;
            document.body.scrollTop = 0;
        };
    };

    window.onunload = function () {
        if ( Editor && Editor.Panel ) {
            Editor.sendToCore( 'window:save-layout',
                               Editor.Panel.getLayout(),
                               Editor.requireIpcEvent );
        }
        else {
            Editor.sendToCore( 'window:save-layout',
                               null,
                               Editor.requireIpcEvent );
        }
    };

    window.onerror = function ( message, filename, lineno, colno, error ) {
        if ( Editor && Editor.sendToWindows ) {
            Editor.sendToWindows('console:error', {
                message: message
            });
        }
        else {
            console.error(message);
        }

        // Just let default handler run.
        return false;
    };
}
catch ( error ) {
    window.onload = function () {
        var remote = require('remote');
        var currentWindow = remote.getCurrentWindow();
        currentWindow.setSize(800, 600);
        currentWindow.center();
        currentWindow.show();
        currentWindow.openDevTools();
        console.error(error.stack || error);
    };
}
