var Ipc = require('ipc');
var Util = require('util');
var Fs = require('fire-fs');
var Path = require('fire-path');
var Winston = require('winston');

require( Editor.url('editor://share/platform')) ;
Editor.JS = require( Editor.url('editor://share/js-utils')) ;
require('./ipc-init');

// ==========================
// logs API
// ==========================

Editor.log = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.normal(text);
    Editor.sendToWindows('console:log', {
        message: text
    });
};

Editor.success = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.success(text);
    Editor.sendToWindows('console:success', {
        message: text
    });
};

Editor.failed = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.failed(text);
    Editor.sendToWindows('console:failed', {
        message: text
    });
};

Editor.info = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.info(text);
    Editor.sendToWindows('console:info', {
        message: text
    });
};

Editor.warn = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.warn(text);
    console.trace();
    Editor.sendToWindows('console:warn', {
        message: text
    });
};

Editor.error = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.error(text);
    console.trace();
    Editor.sendToWindows('console:error', {
        message: text
    });
};

Editor.fatal = function () {
    var text = Util.format.apply(Util, arguments);
    Winston.fatal(text);
    console.trace();

    // NOTE: fatal error will close app immediately, no need for ipc.
};

Ipc.on ( 'console:log', function ( detail ) { Editor.log(detail.message); } );
Ipc.on ( 'console:warn', function ( detail ) { Editor.warn(detail.message); } );
Ipc.on ( 'console:error', function ( detail ) { Editor.error(detail.message); } );
Ipc.on ( 'console:success', function ( detail ) { Editor.success(detail.message); } );
Ipc.on ( 'console:failed', function ( detail ) { Editor.failed(detail.message); } );
Ipc.on ( 'console:info', function ( detail ) { Editor.info(detail.message); } );

// ==========================
// profiles API
// ==========================

var _path2profiles = {};

// type: global, local, project
function _saveProfile ( path, profile ) {
    var json = JSON.stringify(profile, null, 2);
    Fs.writeFileSync(path, json, 'utf8');
}

// type: global, local, project
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

Editor.quit = function () {
    var winlist = Editor.Window.windows;
    for ( var i = 0; i < winlist.length; ++i ) {
        winlist[i].close();
    }
};

Editor.reloadPlayground = function () {
    var cache = require.cache;
    var playgroundPath = Path.join(Editor.cwd,'playground.js');
    var module = cache[playgroundPath];
    var exports = null;

    // unload
    try {
        if ( module ) {
            exports = module.exports;
            if ( exports && exports.unload ) {
                exports.unload();
            }
        }
    }
    catch (err) {
        Editor.error( 'Failed to unload Playground.', err.stack );
    }

    delete cache[playgroundPath];

    // load
    try {
        exports = require(playgroundPath);
        if ( exports && exports.load ) {
            exports.load();
        }
    }
    catch (err) {
        Editor.error( 'Failed to load Playground.', err.stack );
    }
};

// ==========================
// extends
// ==========================

Editor._type2profilepath = {};
Editor.registerProfilePath = function ( type, path ) {
    Editor._type2profilepath[type] = path;
};


Editor._packagePathList = [];
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

Editor.MainMenu = require('./main-menu');
