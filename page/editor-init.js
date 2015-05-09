(function () {

var Remote = require('remote');
var Ipc = require('ipc');
var Util = require('util');
var Path = require('fire-path');
var Url = require('fire-url');
var Async = require('async');

window.Editor = window.Editor || {};
Editor.require = function ( path ) {
    return require( Editor.url(path) );
};

// init argument list sending from core by url?queries
// format: '?foo=bar&hell=world'
// skip '?'
var queryString = decodeURIComponent(location.search.substr(1));
var queryList = queryString.split('&');
var queries = {};
for ( var i = 0; i < queryList.length; ++i ) {
    var pair = queryList[i].split('=');
    if ( pair.length === 2) {
        queries[pair[0]] = pair[1];
    }
}
Editor.argv = queries;

// init & cache remote
Editor.remote = Remote.getGlobal('Editor');
Editor.cwd = Editor.remote.url('app://');
Editor.frameworkPath = Editor.remote.url('editor-framework://');
Editor.isDev = Editor.remote.isDev;

var _urlToPath = function ( base, urlInfo ) {
    if ( urlInfo.pathname ) {
        return Path.join( base, urlInfo.host, urlInfo.pathname );
    }
    return Path.join( base, urlInfo.host );
};

// url
Editor.url = function (url) {
    // NOTE: we cache app:// and editor-framework:// protocol to get rid of ipc-sync function calls
    var urlInfo = Url.parse(url);
    if ( urlInfo.protocol === 'app:' ) {
        return _urlToPath( Editor.cwd, urlInfo );
    }
    else if ( urlInfo.protocol === 'editor-framework:' ) {
        return _urlToPath( Editor.frameworkPath, urlInfo );
    }

    // try ipc-sync function
    return Editor.remote.url(url);
};

Editor.require('editor-framework://share/platform');
Editor.JS = Editor.require('editor-framework://share/js-utils');
Editor.Utils = Editor.require('editor-framework://share/editor-utils');
Editor.require('editor-framework://share/math');
Editor.Easing = Editor.require('editor-framework://share/easing');
Editor.require('editor-framework://page/ipc-init');

// ==========================
// console log API
// ==========================

Editor.log = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.log(text);
    Editor.sendToCore('console:log', text);
};

Editor.success = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: green');
    Editor.sendToCore('console:success', text);
};

Editor.failed = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: red');
    Editor.sendToCore('console:failed', text);
};

Editor.info = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.info(text);
    Editor.sendToCore('console:info', text);
};

Editor.warn = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.warn(text);

    var e = new Error('dummy');
    var lines = e.stack.split('\n');
    text = text + '\n' + lines.splice(2).join('\n');

    Editor.sendToCore('console:warn', text);
};

Editor.error = function ( text ) {
    'use strict';

    if ( arguments.length <= 1 ) {
        text = '' + text;
    } else {
        text = Util.format.apply(Util, arguments);
    }
    console.error(text);

    var e = new Error('dummy');
    var lines = e.stack.split('\n');
    text = text + '\n' + lines.splice(2).join('\n');

    Editor.sendToCore('console:error',text);
};

// ==========================
// Layout API
// ==========================

Editor.loadLayout = function ( anchorEL, cb ) {
    Editor.sendRequestToCore( 'window:query-layout', Editor.requireIpcEvent, function (layout) {
        if ( !layout ) {
            cb();
            return;
        }

        Editor.resetLayout( anchorEL, layout, cb );
    });
};

var _layouting = false;
Editor.resetLayout = function ( anchorEL, layoutInfo, cb ) {
    _layouting = true;

    var importList = EditorUI.createLayout( anchorEL, layoutInfo );
    Async.each( importList, function ( item, done ) {
        Editor.Panel.load (item.panelID, function ( err, frameEL ) {
            if ( err ) {
                done();
                return;
            }

            var dockAt = item.dockEL;
            dockAt.add(frameEL);
            if ( item.active ) {
                dockAt.select(frameEL);
            }
            done();
        });
    }, function ( err ) {
        _layouting = false;

        // close error panels
        EditorUI.DockUtils.flushWithCollapse();
        Editor.saveLayout();
        if ( cb ) cb ();
    } );
};

Editor.saveLayout = function () {
    // don't save layout when we are layouting
    if ( _layouting )
        return;

    window.requestAnimationFrame ( function () {
        Editor.sendToCore('window:save-layout', Editor.Panel.dumpLayout(), Editor.requireIpcEvent);
    });
};

// ==========================
// Ipc events
// ==========================

Ipc.on( 'editor:reset-layout', function ( layoutInfo ) {
    var anchorEL = document.body;
    if ( EditorUI.DockUtils.root ) {
        anchorEL = Polymer.dom(EditorUI.DockUtils.root).parentNode;
    }

    Editor.resetLayout( anchorEL, layoutInfo );
});

Ipc.on( 'ipc-debugger:query', function ( reply ) {
    var ipcInfos = [];
    for ( var p in Ipc._events ) {
        var listeners = Ipc._events[p];
        var count = Array.isArray(listeners) ? listeners.length : 1;
        ipcInfos.push({
            name: p,
            level: 'page',
            count: count,
        });
    }
    reply(ipcInfos);
});

// ==========================
// extends
// ==========================

Editor.registerPanel = function ( panelID, obj ) {
    if ( window[panelID] !== undefined ) {
        Editor.error('Failed to register panel %s, panelID has been registered.', panelID);
        return;
    }

    window[panelID] = Polymer(obj);
};

// ==========================
// load modules
// ==========================

Editor.Window = Editor.require('editor-framework://page/editor-window' );
Editor.Menu = Editor.require('editor-framework://page/editor-menu');
Editor.Panel = Editor.require('editor-framework://page/editor-panel');
Editor.Package = Editor.require('editor-framework://page/editor-package');

Editor.MainMenu = Editor.require('editor-framework://page/main-menu');
Editor.CmdP = Editor.require('editor-framework://page/cmdp');

})();
