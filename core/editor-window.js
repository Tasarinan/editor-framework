var EventEmitter = require('events');
var BrowserWindow = require('browser-window');
var Screen = require('screen');
var Url = require('fire-url');
var Ipc = require('ipc');

/**
 * Window class for operating editor window
 * @class
 * @extends EventEmitter
 * @memberof Editor
 * @alias Window
 * @param {string} name - The window name
 * @param {object} options - The options use [BrowserWindow's options](https://github.com/atom/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions)
 * with the following additional field:
 * @param {string} options.'window-type'] - Can be one of the list:
 *  - `dockable`: Indicate the window contains a dockable panel
 *  - `float`: Indicate the window is standalone, and float on top.
 *  - `fixed-size`: Indicate the window is standalone, float on top and non-resizable.
 *  - `quick`: Indicate the window will never destroyed, it only hides itself when it close which make it quick to show the next time.
 */
function EditorWindow ( name, options ) {
    this._loaded = false;
    this._nextSessionId = 0;
    this._replyCallbacks = {};

    // init options
    this.name = name;
    this.hideWhenBlur = false; // control by options['hide-when-blur'] or winType === 'quick';
    this.windowType = options['window-type'];

    switch ( this.windowType ) {
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
        break;

    case 'quick':
        options.resizable = true;
        options['always-on-top'] = true;
        this.hideWhenBlur = true;
        break;
    }

    this.nativeWin = new BrowserWindow(options);

    if ( this.hideWhenBlur ) {
        this.nativeWin.setAlwaysOnTop(true);
    }

    // BrowserWindow events

    this.nativeWin.on ( 'focus', function ( event ) {
        if ( !Editor.focused ) {
            Editor.focused = true;
            // Editor.emit('focus'); // TODO:
        }
    }.bind(this) );

    this.nativeWin.on ( 'blur', function () {
        // BUG: this is an atom-shell bug,
        //      it can not get focused window at the same frame
        // https://github.com/atom/atom-shell/issues/984
        setImmediate( function () {
            if ( !BrowserWindow.getFocusedWindow() ) {
                Editor.focused = false;
                // Editor.emit('blur'); // TODO:
            }
        }.bind(this));

        if ( this.hideWhenBlur ) {
            // this.nativeWin.close();
            this.nativeWin.hide();
        }
    }.bind(this) );

    this.nativeWin.on ( 'close', function ( event ) {
        // quick window never close, it just hide
        if ( this.windowType === 'quick' ) {
            event.preventDefault();
            this.nativeWin.hide();
        }

        // NOTE: I can not put these in 'closed' event. In Windows, the getBounds will return
        //       zero width and height in 'closed' event
        Editor.Panel._onWindowClose(this);
        EditorWindow.commitWindowStates();
        EditorWindow.saveWindowStates();
    }.bind(this) );

    this.nativeWin.on ( 'closed', function () {
        Editor.Panel._onWindowClosed(this);

        // if we still have sendRequestToPage callbacks,
        // just call them directly to prevent request endless waiting
        for ( var sessionId in this._replyCallbacks ) {
            var cb = this._replyCallbacks[sessionId];
            if (cb) cb();
            delete this._replyCallbacks[sessionId];
        }

        if ( this.isMainWindow ) {
            EditorWindow.removeWindow(this);
            Editor.mainWindow = null;
            Editor.quit();
        }
        else {
            EditorWindow.removeWindow(this);
        }
    }.bind(this) );

    // WebContents events
    // order: dom-ready -> did-frame-finish-load -> did-finish-load

    // this.nativeWin.webContents.on('dom-ready', function ( event ) {
    //     Editor.log('dom-ready');
    // });

    // this.nativeWin.webContents.on('did-frame-finish-load', function() {
    //     Editor.log('did-frame-finish-load');
    // }.bind(this) );

    this.nativeWin.webContents.on('did-finish-load', function() {
        this._loaded = true;

        // TODO: do we really need this?
        // Editor.sendToCore('window:reloaded', this);
    }.bind(this) );

    EditorWindow.addWindow(this); // NOTE: window must be add after nativeWin assigned
}
Editor.JS.extend(EditorWindow,EventEmitter);

/**
 * If this is a main window
 * @member {boolean} isMainWindow
 * @memberof Editor.Window.prototype
 */
Object.defineProperty(EditorWindow.prototype, 'isMainWindow', {
    get: function () {
        return Editor.mainWindow === this;
    }
});

/**
 * If the window is focused
 * @member {boolean} isFocused
 * @memberof Editor.Window.prototype
 */
Object.defineProperty(EditorWindow.prototype, 'isFocused', {
    get: function () {
        return this.nativeWin.isFocused();
    }
});

/**
 * If the window is minimized
 * @member {boolean} isMinimized
 * @memberof Editor.Window.prototype
 */
Object.defineProperty(EditorWindow.prototype, 'isMinimized', {
    get: function () {
        return this.nativeWin.isMinimized();
    }
});

/**
 * If the window is loaded
 * @member {boolean} isLoaded
 * @memberof Editor.Window.prototype
 */
Object.defineProperty(EditorWindow.prototype, 'isLoaded', {
    get: function () {
        return this._loaded;
    }
});

/**
 * Dereference the native window.
 */
EditorWindow.prototype.dispose = function () {
    // NOTE: Important to dereference the window object to allow for GC
    this.nativeWin = null;
};

/**
 * load page by url, and send argv in query property of the url. The page level will parse
 * the argv when the page is ready and save it in Editor.argv in page level
 * @param {string} url
 * @param {object} argv
 */
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
        hash: argv ? encodeURIComponent(JSON.stringify(argv)) : undefined
    } );
    this.nativeWin.loadUrl(url);
};

/**
 * Show the window
 */
EditorWindow.prototype.show = function () {
    this.nativeWin.show();
};

/**
 * Close the window
 */
EditorWindow.prototype.close = function () {
    this._loaded = false;
    this.nativeWin.close();
};

/**
 * Focus on the window
 */
EditorWindow.prototype.focus = function () {
    this.nativeWin.focus();
};

/**
 * Minimize the window
 */
EditorWindow.prototype.minimize = function () {
    this.nativeWin.minimize();
};

/**
 * Restore the window
 */
EditorWindow.prototype.restore = function () {
    this.nativeWin.restore();
};

/**
 * Open the dev-tools
 * @param {object} options
 * @param {boolean} options.detach - If open the dev-tools in a new window
 */
EditorWindow.prototype.openDevTools = function (options) {
    this.nativeWin.openDevTools(options);
};

/**
 * Try to adjust the window to fit the position and size we give
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
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
    if ( typeof w !== 'number' || w <= 0 ) {
        adjustToCenter = true;
        w = 800;
    }
    if ( typeof h !== 'number' || h <= 0 ) {
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

/**
 * Commit the current window state
 * @param {object} layoutInfo
 */
EditorWindow.prototype.commitWindowState = function ( layoutInfo ) {
    var nativeWin = this.nativeWin;
    var winBounds = nativeWin.getBounds();
    if ( !winBounds.width ) {
        Editor.warn('Failed to commit window state. Invalid window width: %s', winBounds.width);
        winBounds.width = 800;
    }
    if ( !winBounds.height ) {
        Editor.warn('Failed to commit window state. Invalid window height %s', winBounds.height);
        winBounds.height = 600;
    }

    // store windows layout
    var winInfo = _windowLayouts[this.name];
    winInfo = Editor.JS.mixin( winInfo || {}, winBounds);
    if ( layoutInfo ) {
        winInfo.layout = layoutInfo;
    }

    _windowLayouts[this.name] = winInfo;
};

/**
 * Restore window's position and size from the `local` profile `layout.windows.json`
 */
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

/**
 * Return the window list of all opened windows
 * @member {Editor.Window[]} windows
 * @memberof Editor.Window
 */
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

/**
 * Find window by name or by BrowserWindow instance
 * @static
 * @param {string|BrowserWindow} param
 * @return {Editor.Window}
 */
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

/**
 * Add an editor window
 * @static
 * @param {Editor.Window} win
 */
EditorWindow.addWindow = function ( win ) {
    _windows.push(win);
};

/**
 * Remove an editor window
 * @static
 * @param {Editor.Window} win
 */
EditorWindow.removeWindow = function ( win ) {
    var idx = _windows.indexOf(win);
    if ( idx === -1 ) {
        Editor.warn( 'Can not find window ' + win.name );
        return;
    }
    _windows.splice(idx,1);

    win.dispose();
};

/**
 * Commit all opened window states
 * @static
 */
EditorWindow.commitWindowStates = function () {
    for ( var i = 0; i < _windows.length; ++i ) {
        var editorWin = _windows[i];
        editorWin.commitWindowState();
    }
};

/**
 * Save current windows' states to profile `layout.windows.json` at `local`
 * @static
 */
EditorWindow.saveWindowStates = function () {
    // we've quit the app, do not save layout after that.
    if ( !Editor.mainWindow )
        return;

    var profile = Editor.loadProfile( 'layout.windows', 'local' );
    profile.windows = {};
    for ( var i = 0; i < _windows.length; ++i ) {
        var editorWin = _windows[i];
        profile.windows[editorWin.name] = _windowLayouts[editorWin.name];
    }
    profile.save();
};

// ========================================
// Ipc
// ========================================

/**
 * Send ipc messages to page
 * @param {string} channel
 * @param {...*} [arg] - whatever arguments the request needs
 */
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
 * Send request to page and wait for the reply
 * @param {string} request - the request to send
 * @param {...*} [arg] - whatever arguments the request needs
 * @param {function} reply - the callback used to handle replied arguments
 * @return {number} The session id can be used in Editor.Window.cancelRequestToCore
 * @see Editor.Window.cancelRequestToPage
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

/**
 * Cancel request via sessionId
 * @param {number} sessionId
 */
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
    editorWin.commitWindowState(layoutInfo);

    // save windows layout
    EditorWindow.saveWindowStates();
});

Ipc.on('window:focus', function ( event ) {
    var win = BrowserWindow.fromWebContents( event.sender );
    var editorWin = Editor.Window.find(win);
    if ( !editorWin ) {
        Editor.warn('Failed to focus, can not find the window.');
        return;
    }

    if ( !editorWin.isFocused ) {
        editorWin.focus();
    }
});

Ipc.on('window:inspect-at', function ( event, x, y ) {
    var nativeWin = BrowserWindow.fromWebContents( event.sender );
    if ( !nativeWin ) {
        Editor.warn('Failed to inspect at %d, %d, can not find the window.', x, y );
        return;
    }

    nativeWin.inspectElement( x, y );
});

module.exports = EditorWindow;
