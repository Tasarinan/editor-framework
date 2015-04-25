var _idToPanelInfo = {};
var _url2link = {};

_getPanels = function ( panelEL ) {
    var panels = [];

    var panelDOM = Polymer.dom(panelEL);
    for ( var i = 0; i < panelDOM.children.length; ++i ) {
        var childEL = panelDOM.children[i];
        var id = childEL.getAttribute('id');
        panels.push(id);
    }

    return panels;
};

_getDocks = function ( dockEL ) {
    var docks = [];

    var dockDOM = Polymer.dom(dockEL);
    for ( var i = 0; i < dockDOM.children.length; ++i ) {
        var childEL = dockDOM.children[i];

        if ( !childEL['ui-dockable'] )
            continue;

        var rect = childEL.getBoundingClientRect();
        var info = {
            'row': childEL.row,
            'width': rect.width,
            'height': rect.height,
        };

        if ( childEL instanceof EditorUI.Panel ) {
            info.type = 'panel';
            info.panels = _getPanels(childEL);
        }
        else {
            info.type = 'dock';
            info.docks = _getDocks(childEL);
        }

        docks.push(info);
    }

    return docks;
};

function _registerIpc ( ipcListener, ipcName, viewEL ) {
    ipcListener.on( ipcName, function () {
        var detail = {};
        if ( arguments.length > 0 ) {
            detail = arguments[0];
        }
        viewEL.fire( ipcName, detail );
    } );

    var domMethod = viewEL[ipcName];
    if ( domMethod ) {
        viewEL.addEventListener( ipcName, domMethod.bind(viewEL) );
    }
}

function _registerProfile ( panelID, type, profile ) {
    profile.save = function () {
        Editor.sendToCore('panel:save-profile', {
            id: panelID,
            type: type,
            profile: profile,
        } );
    };
}

var Panel = {};

Panel.import = function ( url, cb ) {
    var link = _url2link[url];
    if ( link ) {
        link.remove();
        delete _url2link[url];
    }

    link = document.createElement('link');
    link.rel = 'import';
    link.href = url;
    // link.onload = cb;
    link.onerror = function(e) {
        Editor.error('Failed to import %s', link.href);
    };

    document.head.appendChild(link);
    _url2link[url] = link;

    //
    HTMLImports.whenReady( function () {
        cb();
    });
};

Panel.load = function ( url, panelID, panelInfo, cb ) {
    Panel.import(url, function () {
        var ctorPath = panelID.split('.');

        var i;
        var ctorNotFound = false;
        var viewCtor = window;
        for ( i = 0; i < ctorPath.length; ++i ) {
            viewCtor = viewCtor[ctorPath[i]];
            if ( !viewCtor ) {
                ctorNotFound = true;
                break;
            }
        }
        if ( viewCtor === window ) {
            ctorNotFound = true;
        }

        if ( ctorNotFound ) {
            Editor.error('Panel import faield. Can not find constructor %s', panelInfo.ctor );
            return;
        }

        var viewEL = new viewCtor();
        viewEL.setAttribute('id', panelID);
        viewEL.setAttribute('name', panelInfo.title);
        viewEL.classList.add('fit');

        // set size attribute
        if ( panelInfo.width )
            viewEL.setAttribute( 'width', panelInfo.width );

        if ( panelInfo.height )
            viewEL.setAttribute( 'height', panelInfo.height );

        if ( panelInfo['min-width'] )
            viewEL.setAttribute( 'min-width', panelInfo['min-width'] );

        if ( panelInfo['min-height'] )
            viewEL.setAttribute( 'min-height', panelInfo['min-height'] );

        if ( panelInfo['max-width'] )
            viewEL.setAttribute( 'max-width', panelInfo['max-width'] );

        if ( panelInfo['max-height'] )
            viewEL.setAttribute( 'max-height', panelInfo['max-height'] );

        // register ipc events
        var ipcListener = new Editor.IpcListener();
        for ( i = 0; i < panelInfo.messages.length; ++i ) {
            _registerIpc( ipcListener, panelInfo.messages[i], viewEL );
        }

        //
        _idToPanelInfo[panelID] = {
            element: viewEL,
            messages: panelInfo.messages,
            ipcListener: ipcListener
        };
        Editor.sendToCore('panel:dock', panelID, Editor.requireIpcEvent);

        viewEL.profiles = panelInfo.profiles;
        for ( var type in panelInfo.profiles ) {
            _registerProfile ( panelID, type, panelInfo.profiles[type] );
        }

        cb ( null, viewEL );
    });
};

Panel.open = function ( panelID, argv ) {
    Editor.sendToCore('panel:open', panelID, argv);
};

Panel.close = function ( panelID ) {
    var panelInfo = _idToPanelInfo[panelID];

    if ( panelInfo) {
        panelInfo.ipcListener.clear();
        delete _idToPanelInfo[panelID];
    }

    Editor.sendToCore('panel:undock', panelID, Editor.requireIpcEvent);
};

Panel.closeAll = function () {
    for ( var id in _idToPanelInfo ) {
        Panel.close(id);
    }
};

Panel.dispatch = function ( panelID, ipcMessage ) {
    var panelInfo = _idToPanelInfo[panelID];
    if ( !panelInfo ) {
        Editor.warn( 'Failed to receive ipc %s, can not find panel %s', ipcMessage, panelID);
        return;
    }

    // messages
    var idx = panelInfo.messages.indexOf(ipcMessage);
    if ( idx !== -1 ) {
        var detail = {};
        if ( arguments.length > 2 ) {
            detail = arguments[2];
        }
        panelInfo.element.fire( ipcMessage, detail );
    }
};

Panel.getLayout = function () {
    var root = EditorUI.DockUtils.root;
    if ( !root  )
        return null;

    if ( root['ui-dockable'] ) {
        return {
            'type': 'dock',
            'row': root.row,
            'no-collapse': true,
            'docks': _getDocks(root),
        };
    }
    else {
        var id = root.getAttribute('id');
        var rect = root.getBoundingClientRect();

        return {
            'type': 'standalone',
            'panel': id,
            'width': rect.width,
            'height': rect.height,
        };
    }
};

module.exports = Panel;
