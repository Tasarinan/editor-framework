var Ipc = require('ipc');
var Util = require('util');
var Fs = require('fire-fs');
var Path = require('fire-path');
var Winston = require('winston');
var Globby = require('globby');
var Chokidar = require('chokidar');

// ==========================
// console log API
// ==========================

var _consoleConnected = false;
var _logs = [];

/**
 * Log the normal message and show on the console.
 * The method will send ipc message `console:log` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.log = function () {
    var text = Util.format.apply(Util, arguments);

    if ( _consoleConnected )
        _logs.push({ type: 'log', message: text });

    Winston.normal(text);
    Editor.sendToWindows('console:log',text);
};

/**
 * Log the success message and show on the console
 * The method will send ipc message `console:success` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.success = function () {
    var text = Util.format.apply(Util, arguments);

    if ( _consoleConnected )
        _logs.push({ type: 'success', message: text });

    Winston.success(text);
    Editor.sendToWindows('console:success',text);
};

/**
 * Log the failed message and show on the console
 * The method will send ipc message `console:failed` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.failed = function () {
    var text = Util.format.apply(Util, arguments);

    if ( _consoleConnected )
        _logs.push({ type: 'failed', message: text });

    Winston.failed(text);
    Editor.sendToWindows('console:failed',text);
};

/**
 * Log the info message and show on the console
 * The method will send ipc message `console:info` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.info = function () {
    var text = Util.format.apply(Util, arguments);

    if ( _consoleConnected )
        _logs.push({ type: 'info', message: text });

    Winston.info(text);
    Editor.sendToWindows('console:info',text);
};

/**
 * Log the warnning message and show on the console,
 * it also shows the call stack start from the function call it.
 * The method will send ipc message `console:warn` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.warn = function () {
    var text = Util.format.apply(Util, arguments);

    var e = new Error('dummy');
    var lines = e.stack.split('\n');
    text = text + '\n' + lines.splice(2).join('\n');

    if ( _consoleConnected )
        _logs.push({ type: 'warn', message: text });

    Winston.warn(text);
    Editor.sendToWindows('console:warn',text);
};

/**
 * Log the error message and show on the console,
 * it also shows the call stack start from the function call it.
 * The method will sends ipc message `console:error` to all windows.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.error = function () {
    var text = Util.format.apply(Util, arguments);

    var e = new Error('dummy');
    var lines = e.stack.split('\n');
    text = text + '\n' + lines.splice(2).join('\n');

    if ( _consoleConnected )
        _logs.push({ type: 'error', message: text });

    Winston.error(text);
    Editor.sendToWindows('console:error',text);
};

/**
 * Log the fatal message and show on the console,
 * the app will quit immediately after that.
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.fatal = function () {
    var text = Util.format.apply(Util, arguments);

    var e = new Error('dummy');
    var lines = e.stack.split('\n');
    text = text + '\n' + lines.splice(2).join('\n');

    if ( _consoleConnected )
        _logs.push({ type: 'fatal', message: text });

    Winston.fatal(text);
    // NOTE: fatal error will close app immediately, no need for ipc.
};

/**
 * Connect to console panel. Once the console connected, all logs will kept in `core-level` and display
 * on the console panel in `page-level`.
 */
Editor.connectToConsole = function () {
    _consoleConnected = true;
};

/**
 * Clear the logs
 */
Editor.clearLog = function () {
    _logs = [];
};

Ipc.on ( 'console:log', function () { Editor.log.apply(Editor,arguments); } );
Ipc.on ( 'console:success', function () { Editor.success.apply(Editor,arguments); } );
Ipc.on ( 'console:failed', function () { Editor.failed.apply(Editor,arguments); } );
Ipc.on ( 'console:info', function () { Editor.info.apply(Editor,arguments); } );
Ipc.on ( 'console:warn', function () { Editor.warn.apply(Editor,arguments); } );
Ipc.on ( 'console:error', function () { Editor.error.apply(Editor,arguments); } );
Ipc.on ( 'console:clear', function () { Editor.clearLog(); } );
Ipc.on ( 'console:query', function ( reply ) {
    reply(_logs);
});

// ==========================
// pre-require modules
// ==========================

require('../share/platform') ;
Editor.JS = require('../share/js-utils') ;
Editor.Utils = require('../share/editor-utils');
require('../share/math');
require('./ipc-init');
Editor.Selection = require('../share/selection');
Editor.KeyCode = require('../share/keycode');

// ==========================
// profiles API
// ==========================

var _path2profiles = {};
function _saveProfile ( path, profile ) {
    var json = JSON.stringify(profile, null, 2);
    Fs.writeFileSync(path, json, 'utf8');
}

/**
 * Load a profile based on the name and type you send in. You must register the type
 * via {@link Editor.registerProfilePath}. If no profile found, the function will wrap and return
 * the defaultProfile.
 * @param {string} name - The name of the profile.
 * @param {string} type - The type of the profile, make sure you register the type via {@link Editor.registerProfilePath}.
 * @param {object} defaultProfile - The default profile to use if the profile is not found.
 * @return {object} A profile object with two additional function:
 *  - save: save the profile.
 *  - clear: clear all properties in the profile.
 * @see Editor.registerProfilePath
 */
Editor.loadProfile = function ( name, type, defaultProfile ) {
    var path = Editor._type2profilepath[type];
    if ( !path ) {
        Editor.error( 'Failed to load profile by type %s, please register it first.', type );
        return null;
    }
    path = Path.join(path, name+'.json');

    var profile = _path2profiles[path];
    if ( profile ) {
        return profile;
    }

    var profileProto = {
        save: function () {
            _saveProfile( path, this );
        },
        clear: function () {
            for ( var p in this ) {
                if ( p !== 'save' && p !== 'clear' ) {
                    delete this[p];
                }
            }
        },
    };

    profile = defaultProfile || {};

    if ( !Fs.existsSync(path) ) {
        Fs.writeFileSync(path, JSON.stringify(profile, null, 2));
    }
    else {
        try {
            profile = JSON.parse(Fs.readFileSync(path));

            var p;
            if ( defaultProfile ) {
                for ( p in profile ) {
                    if ( defaultProfile[p] === undefined )
                        delete profile[p];
                }
                for ( p in defaultProfile ) {
                    if ( profile[p] === undefined ) {
                        profile[p] = defaultProfile[p];
                    }
                }
                // save again
                Fs.writeFileSync(path, JSON.stringify(profile, null, 2));
            }
        }
        catch ( err ) {
            if ( err ) {
                Editor.warn( 'Failed to load profile %s, error message: %s', name, err.message );
                profile = {};
            }
        }
    }

    profile = Editor.JS.mixin( profile, profileProto );
    _path2profiles[path] = profile;

    return profile;
};

// ==========================
// misc API
// ==========================

var _packageWatcher;

/**
 * Quit the App
 */
Editor.quit = function () {
    if ( _packageWatcher ) {
        _packageWatcher.close();
    }

    var winlist = Editor.Window.windows;
    for ( var i = 0; i < winlist.length; ++i ) {
        winlist[i].close();
    }
};

/**
 * Search and load all packages from the path you registerred
 * @see Editor.registerPackagePath
 */
Editor.loadPackages = function () {
    var i, src = [];
    for ( i = 0; i < Editor._packagePathList.length; ++i ) {
        src.push( Editor._packagePathList[i] + '/*/package.json' );
    }

    var paths = Globby.sync( src );
    for ( i = 0; i < paths.length; ++i ) {
        Editor.Package.load( Path.dirname(paths[i]) );
    }

    Editor.watchPackages();
};

/**
 * Watch packages
 */
Editor.watchPackages = function () {
    var src = [];
    for ( i = 0; i < Editor._packagePathList.length; ++i ) {
        src.push( Editor._packagePathList[i] );
    }
    _packageWatcher = Chokidar.watch(src, {
        ignored: /[\/\\]\./,
        ignoreInitial: true,
        persistent: true,
    });

    _packageWatcher
    .on('add', function(path) {
        _packageWatcher.add(path);
    })
    .on('addDir', function(path) {
        _packageWatcher.add(path);
    })
    .on('unlink', function(path) {
        _packageWatcher.unwatch(path);
    })
    .on('unlinkDir', function(path) {
        _packageWatcher.unwatch(path);
    })
    .on('change', function (path) {
        var packageInfo = Editor.Package.packageInfo(path);
        if ( packageInfo ) {
            // reload panel
            var panelPath = Path.join(packageInfo._path, 'panel');
            if ( Path.contains(panelPath, path) ) {
                for ( var panelName in packageInfo.panels ) {
                    var panelID = packageInfo.name + '.' + panelName;
                    Editor.sendToWindows( 'panel:out-of-date', panelID );
                }
                return;
            }

            // reload element
            var elementPath = Path.join(packageInfo._path, 'element');
            if ( Path.contains(elementPath, path) ) {
                return;
            }

            // reload core
            Editor.Package.reload(packageInfo._path);
        }
    })
    .on('error', function (error) {
        Editor.error('Package Watcher Error: %s', error.message);
    })
    // .on('ready', function() { Editor.log('Initial scan complete. Ready for changes.'); })
    // .on('raw', function(event, path, details) { Editor.log('Raw event info:', event, path, details); })
    ;
};

// ==========================
// extends
// ==========================

Editor._type2profilepath = {};
Editor._packagePathList = [];

/**
 * Register profile type with the path you provide.
 * @param {string} type - The type of the profile you want to register.
 * @param {string} path - The path for the register type.
 * @see Editor.loadProfile
 */
Editor.registerProfilePath = function ( type, path ) {
    Editor._type2profilepath[type] = path;
};

/**
 * Register a path, when loading packages, it will search the path you registerred.
 * @param {string} path - A absolute path for searching your packages.
 * @see Editor.loadPackages
 */
Editor.registerPackagePath = function ( path ) {
    Editor._packagePathList.push(path);
};

// ==========================
// load modules
// ==========================

Editor.Menu = require('./editor-menu');
Editor.Window = require('./editor-window');
Editor.Panel = require('./editor-panel');
Editor.Package = require('./editor-package');
Editor.Debugger = require('./debugger');

Editor.MainMenu = require('./main-menu');
