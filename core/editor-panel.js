var Ipc = require('ipc');
var BrowserWindow = require('browser-window');

/**
 * Redirect panel messages to its registered windows.
 */
var Panel = {};
var _panelIDToWindows = {};
var _panelIDToArgv = {};

Ipc.on('panel:page-ready', function ( reply, panelID ) {
    if ( !panelID ) {
        Editor.error( 'Invalid panelID ' + panelID );
        reply( {} );
        return;
    }

    var pair = panelID.split('@');
    if ( pair.length !== 2 ) {
        Editor.error( 'Invalid panelID ' + panelID );
        reply( {} );
        return;
    }

    var panelName = pair[0];
    var packageName = pair[1];

    var packageInfo = Editor.PackageManager.getPackageInfo(packageName);
    if ( !packageInfo ) {
        Editor.error( 'Invalid package info ' + packageName );
        reply( {} );
        return;
    }

    if ( !packageInfo.panels ) {
        Editor.error( 'Invalid package info %s, can not find panels property', packageName );
        reply( {} );
        return;
    }

    if ( !packageInfo.panels[panelName] ) {
        Editor.error( 'Invalid package info %s, can not find %s property', packageName, panelName );
        reply( {} );
        return;
    }

    var panelInfo = packageInfo.panels[panelName];
    var path = Editor.PackageManager.getPackagePath(packageName);

    // load profiles
    for ( var type in panelInfo.profiles ) {
        var profile = panelInfo.profiles[type];
        profile = Editor.loadProfile( panelID, type, profile );
        panelInfo.profiles[type] = profile;
    }

    reply({
        'panel-info': panelInfo,
        'package-path': path,
    });
});

Ipc.on('panel:ready', function ( panelID ) {
    var argv = _panelIDToArgv[panelID];
    Editor.sendToPanel( panelID, 'panel:open', argv );
});

Ipc.on('panel:dock', function ( event, panelID ) {
    var browserWin = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(browserWin);
    Panel.dock( panelID, editorWin );
});

Ipc.on('panel:undock', function ( event, panelID ) {
    var browserWin = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(browserWin);
    Panel.undock( panelID, editorWin );
});

//
Ipc.on('panel:save-profile', function ( detail ) {
    var panelID = detail.id;
    var type = detail.type;
    var panelProfile = detail.profile;

    var profile = Editor.loadProfile( panelID, type );
    if ( profile ) {
        profile.clear();
        Fire.JS.mixin(profile, panelProfile);
        profile.save();
    }
});

Panel.templateUrl = 'editor://static/window.html';

//
Panel.open = function ( panelID, panelInfo, argv ) {
    _panelIDToArgv[panelID] = argv;

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
    var options = {
        'use-content-size': true,
        'width': parseInt(panelInfo.width),
        'height': parseInt(panelInfo.height),
        'min-width': parseInt(panelInfo['min-width']),
        'min-height': parseInt(panelInfo['min-height']),
        'max-width': parseInt(panelInfo['max-width']),
        'max-height': parseInt(panelInfo['max-height']),
    };

    // load layout-settings, and find windows by name
    var profile = Editor.loadProfile('layout', 'local' );
    var panels = profile.panels;
    if ( profile.panels && profile.panels[panelID] ) {
        var panelProfile = profile.panels[panelID];
        windowName = panelProfile.window;

        // find window by name
        editorWin = Editor.Window.find(windowName);
        if ( editorWin ) {
            // TODO: ??? how can I dock it???
            return;
        }

        options.x = parseInt(panelProfile.x);
        options.y = parseInt(panelProfile.y);
        options.width = parseInt(panelProfile.width);
        options.height = parseInt(panelProfile.height);
    }

    // create new window
    // DISABLE: currently, I don't want to support page
    // if ( panelInfo.page ) {
    //     url = panelInfo.page;
    // }

    var winType = panelInfo.type || 'dockable';
    switch ( panelInfo.type ) {
    case 'dockable':
        options.resizable = true;
        options['always-on-top'] = false;
        break;

    case 'float':
        options.resizable = true;
        options['always-on-top'] = true;
        break;

    case 'fixed-size':
        options.resizable = false;
        options['always-on-top'] = true;
        // NOTE: fixed-size window always use package.json settings
        options.width = parseInt(panelInfo.width);
        options.height = parseInt(panelInfo.height);
        break;

    case 'quick':
        options.resizable = true;
        options['always-on-top'] = true;
        options['close-when-blur'] = true;
        break;
    }

    //
    editorWin = new Editor.Window(windowName, options);

    // BUG: https://github.com/atom/atom-shell/issues/1321
    editorWin.nativeWin.setContentSize( options.width, options.height );
    editorWin.nativeWin.setMenuBarVisibility(false);
    editorWin.load(Panel.templateUrl, {
        panelID: panelID
    });
    editorWin.focus();
};

Panel.findWindow = function ( panelID ) {
    return _panelIDToWindows[panelID];
};

Panel.findWindows = function (packageName) {
    var wins = [];

    for ( var p in _panelIDToWindows ) {
        var pair = p.split('@');
        if ( pair.length !== 2 ) {
            continue;
        }

        var name = pair[1];
        if ( name === packageName ) {
            var editorWin = _panelIDToWindows[p];
            if ( wins.indexOf (editorWin) === -1 )
                wins.push(editorWin);
        }
    }

    return wins;
};

Panel.findPanels = function ( packageName ) {
    var panels = [];
    for ( var p in _panelIDToWindows ) {
        var pair = p.split('@');
        if ( pair.length !== 2 ) {
            continue;
        }

        var name = pair[1];
        if ( name === packageName ) {
            panels.push(pair[0]);
        }
    }

    return panels;
};

Panel.dock = function ( panelID, win ) {
    // Editor.hint('dock %s', panelID ); // DEBUG
    _panelIDToWindows[panelID] = win;
};

Panel.undock = function ( panelID, win ) {
    // Editor.hint('undock %s', panelID ); // DEBUG
    var editorWin = _panelIDToWindows[panelID];
    if ( editorWin === win )
        return delete _panelIDToWindows[panelID];
    return false;
};

// TODO: we need to check if the windows panel only have that panel so that we can close the window
Panel.closeAll = function (packageName) {
    Editor.warn('TODO: @Johnny please implement Panel.closeAll');

    // var wins = Panel.findWindows(packageName);
    // for (var i = 0; i < wins.length; i++) {
    //     var win = wins[i];
    //     win.close();
    // }
    // delete _panelIDToWindows[...];
};

// NOTE: this only invoked in fire-window on-closed event
Panel._onWindowClosed = function ( editorWin ) {
    for ( var id in _panelIDToWindows ) {
        var win = _panelIDToWindows[id];
        if ( win === editorWin ) {
            delete _panelIDToWindows[id];
        }
    }
};

module.exports = Panel;
