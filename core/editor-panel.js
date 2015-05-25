var Ipc = require('ipc');
var BrowserWindow = require('browser-window');

/**
 * Panel module for operating specific panel
 * @namespace Editor.Panel
 */
var Panel = {};
var _panel2windows = {};
var _panel2argv = {};

Panel.templateUrl = 'editor-framework://static/window.html';

var _dock = function ( panelID, win ) {
    // Editor.info('%s dock to %s', panelID, win.name ); // DEBUG

    var editorWin = _panel2windows[panelID];

    // if we found same panel dock in different place
    if ( editorWin && editorWin !== win ) {
        // TODO: should we report error ????
    }

    _panel2windows[panelID] = win;
};

var _undock = function ( panelID ) {
    var editorWin = _panel2windows[panelID];
    // Editor.info('%s undock from %s', panelID, editorWin.name ); // DEBUG

    if ( editorWin ) {
        editorWin.sendToPage( 'panel:undock', panelID );
        delete _panel2windows[panelID];
        return editorWin;
    }
    return null;
};

var _saveLayout = function ( editorWin, panelID ) {
    // save standalone panel's layout
    if ( !editorWin.isMainWindow ) {
        var panelProfile = Editor.loadProfile( 'layout.' + panelID, 'local' );
        var winSize = editorWin.nativeWin.getContentSize();
        var winPos = editorWin.nativeWin.getPosition();

        panelProfile.x = winPos[0];
        panelProfile.y = winPos[1];
        panelProfile.width = winSize[0];
        panelProfile.height = winSize[1];
        panelProfile.save();
    }
};

/**
 * Open a panel and pass argv to it. The argv will be sent as argument in `panel:open` message in page-level
 * @param {string} panelID - a panelID
 * @param {object} argv - argument store as key-value table, which will pass later
 * @method open
 * @memberof Editor.Panel
 */
Panel.open = function ( panelID, argv ) {
    var panelInfo = Editor.Package.panelInfo(panelID);
    if ( !panelInfo ) {
        Editor.error('Failed to open panel %s, panel info not found.', panelID);
        return;
    }

    _panel2argv[panelID] = argv;

    var editorWin = Panel.findWindow(panelID);
    if ( editorWin ) {
        // if we found the window, send panel:open to it
        Editor.sendToPanel( panelID, 'panel:open', argv );
        editorWin.show();
        editorWin.focus();
        return;
    }

    //
    var windowName = 'editor-window-' + new Date().getTime();
    var windowOptions = {
        'use-content-size': true,
        'width': parseInt(panelInfo.width),
        'height': parseInt(panelInfo.height),
        'min-width': parseInt(panelInfo['min-width']),
        'min-height': parseInt(panelInfo['min-height']),
        'max-width': parseInt(panelInfo['max-width']),
        'max-height': parseInt(panelInfo['max-height']),
    };

    // load layout-settings, and find windows by name
    var layoutProfile = Editor.loadProfile('layout.' + panelID, 'local' );
    if ( layoutProfile ) {
        windowOptions.x = parseInt(layoutProfile.x);
        windowOptions.y = parseInt(layoutProfile.y);
        windowOptions.width = parseInt(layoutProfile.width);
        windowOptions.height = parseInt(layoutProfile.height);
    }

    windowOptions['window-type'] = panelInfo.type || 'dockable';

    // NOTE: fixed-size window always use package.json settings
    if ( panelInfo.type === 'fixed-size' ) {
        windowOptions.width = parseInt(panelInfo.width);
        windowOptions.height = parseInt(panelInfo.height);
    }

    if ( isNaN(windowOptions.width) ) windowOptions.width = 400;
    if ( isNaN(windowOptions.height) ) windowOptions.height = 400;
    if ( isNaN(windowOptions['min-width']) ) windowOptions['min-width'] = 200;
    if ( isNaN(windowOptions['min-height']) ) windowOptions['min-height'] = 200;

    // create new window
    // DISABLE: currently, I don't want to support page
    // if ( panelInfo.page ) {
    //     url = panelInfo.page;
    // }

    //
    editorWin = new Editor.Window(windowName, windowOptions);
    _dock( panelID, editorWin );

    // BUG: https://github.com/atom/atom-shell/issues/1321
    editorWin.nativeWin.setContentSize( windowOptions.width, windowOptions.height );
    editorWin.nativeWin.setMenuBarVisibility(false);
    editorWin.load(Panel.templateUrl, {
        panelID: panelID
    });
    editorWin.focus();
};

/**
 * Close a panel via panelID
 * @param {string} panelID - a panelID
 * @method close
 * @memberof Editor.Panel
 */
Panel.close = function ( panelID ) {
    var editorWin = _undock(panelID);
    if ( editorWin ) {

        _saveLayout( editorWin, panelID );

        // check if we have other panels in the same window
        // if no panels left, we close the window
        var found = false;
        for ( var id in _panel2windows ) {
            if ( editorWin === _panel2windows[id] ) {
                found = true;
                break;
            }
        }

        // if not panel exists in this window, and it is not the main window, close it.
        if ( !found && !editorWin.isMainWindow ) {
            editorWin.close();
        }
    }
};

/**
 * Find and return an editor window that contains the panelID
 * @param {string} panelID - a panelID
 * @return {Editor.Window}
 * @method findWindow
 * @memberof Editor.Panel
 */
Panel.findWindow = function ( panelID ) {
    return _panel2windows[panelID];
};

/**
 * Find and return editor window list that contains panel defined in package via packageName
 * @param {string} packageName
 * @return {Editor.Window[]}
 * @method findWindows
 * @memberof Editor.Panel
 */
Panel.findWindows = function (packageName) {
    var wins = [];

    for ( var p in _panel2windows ) {
        var pair = p.split('.');
        if ( pair.length !== 2 ) {
            continue;
        }

        var name = pair[1];
        if ( name === packageName ) {
            var editorWin = _panel2windows[p];
            if ( wins.indexOf (editorWin) === -1 )
                wins.push(editorWin);
        }
    }

    return wins;
};

/**
 * Find and return panel ID list that contains panel defined in package via packageName
 * @param {string} packageName
 * @return {string[]}
 * @method findPanels
 * @memberof Editor.Panel
 */
Panel.findPanels = function ( packageName ) {
    var panelIDs = [];
    for ( var p in _panel2windows ) {
        var pair = p.split('.');
        if ( pair.length !== 2 ) {
            continue;
        }

        var name = pair[0];
        if ( name === packageName ) {
            panelIDs.push(pair);
        }
    }

    return panelIDs;
};

/**
 * Close all panels defined in package via packageName
 * @param {string} packageName
 * @method closeAll
 * @memberof Editor.Panel
 */
Panel.closeAll = function (packageName) {
    var panelIDs = Panel.findPanels(packageName);
    for (var i = 0; i < panelIDs.length; ++i) {
        Panel.close( panelIDs[i] );
    }
};

// NOTE: this only invoked in fire-window on-closed event
Panel._onWindowClosed = function ( editorWin ) {
    for ( var id in _panel2windows ) {
        var win = _panel2windows[id];
        if ( win === editorWin ) {
            _saveLayout( editorWin, id );
            delete _panel2windows[id];
        }
    }
};

// ========================================
// Ipc
// ========================================

Ipc.on('panel:query-info', function ( reply, panelID ) {
    if ( !panelID ) {
        Editor.error( 'Empty panelID' );
        reply();
        return;
    }

    // get panelInfo
    var panelInfo = Editor.Package.panelInfo(panelID);
    if ( panelInfo ) {
        // load profiles
        for ( var type in panelInfo.profiles ) {
            var profile = panelInfo.profiles[type];
            profile = Editor.loadProfile( panelID, type, profile );
            panelInfo.profiles[type] = profile;
        }
    }

    //
    reply(panelInfo);
});

Ipc.on('panel:ready', function ( panelID ) {
    var argv = _panel2argv[panelID];
    Editor.sendToPanel( panelID, 'panel:open', argv );
});

Ipc.on('panel:open', function ( panelID, argv ) {
    Panel.open( panelID, argv );
});

Ipc.on('panel:dock', function ( event, panelID ) {
    var browserWin = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(browserWin);
    _dock( panelID, editorWin );
});

Ipc.on('panel:close', function ( panelID ) {
    Panel.close( panelID );
});

Ipc.on('panel:wait-for-close', function ( reply, panelID ) {
    Panel.close( panelID );
    reply();
});

//
Ipc.on('panel:save-profile', function ( panelID, type, panelProfile ) {
    var profile = Editor.loadProfile( panelID, type );
    if ( profile ) {
        profile.clear();
        Editor.JS.mixin(profile, panelProfile);
        profile.save();
    }
});

module.exports = Panel;
