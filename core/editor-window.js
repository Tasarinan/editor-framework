var EventEmitter = require('events');
var BrowserWindow = require('browser-window');
var Screen = require('screen');
var Url = require('fire-url');
var Ipc = require('ipc');

//
function EditorWindow ( name, options ) {
    this._loaded = false;
    this._nextSessionId = 0;
    this._replyCallbacks = {};

    // init options
    this.name = name;
    this.closeWhenBlur = options['close-when-blur'] || false;

    this.nativeWin = new BrowserWindow(options);

    if ( this.closeWhenBlur ) {
        this.nativeWin.setAlwaysOnTop(true);
    }

    // init events
    this.nativeWin.on ( 'blur', function () {
        if ( this.closeWhenBlur ) {
            this.nativeWin.close();
        }
    }.bind(this) );

    this.nativeWin.on ( 'closed', function () {
        Editor.Panel._onWindowClosed(this);
        if ( this.isMainWindow ) {
            EditorWindow.saveLayout();
            EditorWindow.removeWindow(this);
            Editor.mainWindow = null;
            Editor.quit();
        }
        else {
            EditorWindow.removeWindow(this);
        }
    }.bind(this) );

    this.nativeWin.webContents.on('did-finish-load', function() {
        this._loaded = true;
        // Editor.sendToCore('window:reloaded', this);
    }.bind(this) );

    EditorWindow.addWindow(this); // NOTE: window must be add after nativeWin assigned
}
Editor.JS.extend(EditorWindow,EventEmitter);

Object.defineProperty(EditorWindow.prototype, 'isMainWindow', {
    get: function () {
        return Editor.mainWindow === this;
    }
});

Object.defineProperty(EditorWindow.prototype, 'isFocused', {
    get: function () {
        return this.nativeWin.isFocused();
    }
});

Object.defineProperty(EditorWindow.prototype, 'isMinimized', {
    get: function () {
        return this.nativeWin.isMinimized();
    }
});

Object.defineProperty(EditorWindow.prototype, 'isLoaded', {
    get: function () {
        return this._loaded;
    }
});

//
EditorWindow.prototype.load = function ( editorUrl, argv ) {
    var resultUrl = Editor.url(editorUrl);
    if ( !resultUrl ) {
        Editor.error( 'Failed to load page %s for window "%s"', editorUrl, this.name );
        return;
    }

    this._loaded = false;
    var url = Url.format( {
        protocol: 'file',
        pathname: resultUrl,
        slashes: true,
        query: argv,
    } );
    this.nativeWin.loadUrl(url);
};

EditorWindow.prototype.show = function () {
    this.nativeWin.show();
};

EditorWindow.prototype.close = function () {
    this._loaded = false;
    this.nativeWin.close();
};

EditorWindow.prototype.focus = function () {
    this.nativeWin.focus();
};

EditorWindow.prototype.minimize = function () {
    this.nativeWin.minimize();
};

EditorWindow.prototype.restore = function () {
    this.nativeWin.restore();
};

EditorWindow.prototype.openDevTools = function () {
    this.nativeWin.openDevTools();
};

EditorWindow.prototype.adjust = function ( x, y, w, h ) {
    var adjustToCenter = false;
    if ( typeof x !== 'number' ) {
        adjustToCenter = true;
        x = 0;
    }
    if ( typeof y !== 'number' ) {
        adjustToCenter = true;
        y = 0;
    }
    if ( typeof w !== 'number' ) {
        adjustToCenter = true;
        w = 800;
    }
    if ( typeof h !== 'number' ) {
        adjustToCenter = true;
        h = 600;
    }

    var display = Screen.getDisplayMatching( { x: x, y: y, width: w, height: h } );
    this.nativeWin.setSize(w,h);
    this.nativeWin.setPosition( display.workArea.x, display.workArea.y );

    if ( adjustToCenter ) {
        this.nativeWin.center();
    }
    else {
        this.nativeWin.setPosition( x, y );
    }
};

EditorWindow.prototype.restorePositionAndSize = function () {
    // restore window size and position
    var size = this.nativeWin.getSize();
    var winPosX, winPosY, winSizeX = size[0], winSizeY = size[1];

    var profile = Editor.loadProfile('layout.windows', 'local');
    if ( profile.windows && profile.windows[this.name] ) {
        var winInfo = profile.windows[this.name];
        winPosX = winInfo.x;
        winPosY = winInfo.y;
        winSizeX = winInfo.width;
        winSizeY = winInfo.height;
    }
    this.adjust( winPosX, winPosY, winSizeX, winSizeY );
};

// static window operation
var _windows = [];
var _windowLayouts = {};

Object.defineProperty(EditorWindow, 'windows', {
    get: function () {
        return _windows.slice();
    }
});

// NOTE: this will in case save-layout not invoke,
//       and it will missing info for current window
EditorWindow.loadLayouts = function () {
    _windowLayouts = {};

    var profile = Editor.loadProfile( 'layout.windows', 'local', {
        windows: {},
    });
    for ( var name in profile.windows ) {
        var info = profile.windows[name];
        _windowLayouts[name] = info;
    }
};

EditorWindow.find = function ( param ) {
    var i, win;

    if ( typeof param === "string" ) {
        for ( i = 0; i < _windows.length; ++i ) {
            win = _windows[i];
            if ( win.name === param )
                return win;
        }
        return null;
    }

    if ( param instanceof BrowserWindow ) {
        for ( i = 0; i < _windows.length; ++i ) {
            win = _windows[i];
            if ( win.nativeWin === param )
                return win;
        }
        return null;
    }

    return null;
};

EditorWindow.addWindow = function ( win ) {
    _windows.push(win);
};

EditorWindow.removeWindow = function ( win ) {
    var idx = _windows.indexOf(win);
    if ( idx === -1 ) {
        Editor.warn( 'Can not find window ' + win.name );
        return;
    }
    _windows.splice(idx,1);
};

EditorWindow.saveLayout = function () {
    // we've quit the app, do not save layout after that.
    if ( !Editor.mainWindow )
        return;

    var profile = Editor.loadProfile( 'layout.windows', 'local' );
    profile.windows = {};
    for ( var i = 0; i < _windows.length; ++i ) {
        var win = _windows[i];
        profile.windows[win.name] = _windowLayouts[win.name];
    }
    profile.save();
};

// ========================================
// Ipc
// ========================================

EditorWindow.prototype.sendToPage = function () {
    var webContents = this.nativeWin.webContents;
    if (webContents) {
        webContents.send.apply( webContents, arguments );
        return;
    }

    console.error('Failed to send "%s" to %s because web contents not yet loaded',
                  arguments[0], this.name);
};

/**
 * @method sendRequestToPage
 * @param {string} request - the request to send
 * @param {...*} [arg] - whatever arguments the request needs
 * @param {function} reply - the callback used to handle replied arguments
 * @return {number} - session id, can be used in Editor.cancelRequestToCore
 */
EditorWindow.prototype.sendRequestToPage = function (request) {
    'use strict';
    if (typeof request === 'string') {
        var args = [].slice.call(arguments, 1);
        var reply = args[args.length - 1];
        if (typeof reply === 'function') {
            args.pop();

            var sessionId = this._nextSessionId++;
            var key = "" + sessionId;
            this._replyCallbacks[key] = reply;

            this.sendToPage('editor:sendreq2page', request, args, sessionId);
            return sessionId;
        }
        else {
            Editor.error('The reply must be of type function');
        }
    }
    else {
        Editor.error('The request must be of type string');
    }
    return -1;
};

EditorWindow.prototype.cancelRequestToPage = function (sessionId) {
    'use strict';
    var key = "" + sessionId;
    var cb = this._replyCallbacks[key];
    if ( cb ) {
        delete this._replyCallbacks[key];
    }
};

EditorWindow.prototype._reply = function (args,sessionId) {
    'use strict';
    var key = "" + sessionId;
    var cb = this._replyCallbacks[key];
    if (cb) {
        cb.apply(null, args);
        delete this._replyCallbacks[key];
    }
};

Ipc.on('editor:sendreq2page:reply', function replyCallback (event, args, sessionId) {
    var win = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(win);
    if ( !editorWin ) {
        Editor.warn('editor:sendreq2page:reply failed: Can not find the window.' );
        return;
    }

    editorWin._reply(args,sessionId);
});

Ipc.on('window:open', function ( name, url, options ) {
    var editorWin = new Editor.Window(name, options);
    editorWin.nativeWin.setMenuBarVisibility(false);
    editorWin.load(url, options.argv);
    editorWin.show();
});

Ipc.on('window:query-layout', function ( event, reply ) {
    var win = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(win);
    if ( !editorWin ) {
        Editor.warn('Failed to query layout, can not find the window.');
        reply();
        return;
    }

    var layout = null;
    var winInfo = _windowLayouts[editorWin.name];
    if ( winInfo && winInfo.layout ) {
        layout = winInfo.layout;
    }

    reply(layout);
});

Ipc.on('window:save-layout', function ( event, layoutInfo ) {
    var win = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(win);
    if ( !editorWin ) {
        Editor.warn('Failed to save layout, can not find the window.');
        return;
    }

    var winSize = win.getSize();
    var winPos = win.getPosition();
    var winInfo = {
        x: winPos[0],
        y: winPos[1],
        width: winSize[0],
        height: winSize[1],
        layout: layoutInfo
    };

    // save windows layout
    _windowLayouts[editorWin.name] = winInfo;
    EditorWindow.saveLayout();

    // save panel standalone layout
    var panels = [];
    if ( layoutInfo ) {
        if ( layoutInfo.type === 'dock' ) {
            _getPanels( layoutInfo.docks, panels );
        }
    }
    for ( var i = 0; i < panels.length; ++i ) {
        var panel = panels[i];
        var panelProfile = Editor.loadProfile( 'layout.' + panel.name, 'local' );
        panelProfile.window = editorWin.name;
        panelProfile.x = winPos[0];
        panelProfile.y = winPos[1];
        panelProfile.width = panel.width;
        panelProfile.height = panel.height;
        panelProfile.save();
    }
});

var _getPanels = function ( docks, panels ) {
    for ( var i = 0; i < docks.length; ++i ) {
        var info = docks[i];

        if ( info.type === 'dock' ) {
            _getPanels( info.docks, panels );
        }
        else if ( info.type === 'panel' ) {
            for ( var j = 0; j < info.panels.length; ++j ) {
                var panel = info.panels[j];
                panels.push({
                    name: panel,
                    width: info.width,
                    height: info.height,
                });
            }
        }
    }
};

module.exports = EditorWindow;
