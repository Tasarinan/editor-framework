var _idToPagePanelInfo = {};
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
            info.active = childEL.activeIndex;
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

function _registerIpc ( panelID, frameEL, ipcListener, ipcName ) {
    var fn = frameEL[ipcName];
    if ( !fn || typeof fn !== 'function' ) {
        if ( ipcName !== 'panel:open') {
            Editor.warn('Failed to register ipc message %s in panel %s, Can not find implementation', ipcName, panelID );
        }
        return;
    }

    ipcListener.on( ipcName, function () {
        var fn = frameEL[ipcName];
        if ( !fn || typeof fn !== 'function' ) {
            Editor.warn('Failed to respond ipc message %s in panel %s, Can not find implementation', ipcName, panelID );
            return;
        }
        fn.apply( frameEL, arguments );
    } );
}

function _registerProfile ( panelID, type, profile ) {
    profile.save = function () {
        Editor.sendToCore('panel:save-profile', panelID, type, profile);
    };
}

var Panel = {};

Panel.import = function ( url, cb ) {
    var link = _url2link[url];
    if ( link ) {
        HTMLImports.whenReady( function () {
            cb();
        });
        return;
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

Panel.load = function ( panelID, cb ) {
    Editor.sendRequestToCore('panel:query-info', panelID, function ( panelInfo ) {
        if ( !panelInfo ) {
            Editor.error('Panel %s import faield. panelInfo not found', panelID );
            cb ( new Error('Panel info not found') );
            return;
        }

        var Path = require('fire-path');
        var framePath = Path.join( panelInfo.path, panelInfo.frame );

        Panel.import(framePath, function () {
            var frameCtor = window[panelID];
            if ( !frameCtor ) {
                Editor.error('Panel import faield. Can not find constructor %s', panelInfo.ctor );
                cb ( new Error( 'Constructor ' + panelInfo.ctor + ' not found' ) );
                return;
            }

            Editor.sendToCore('panel:dock', panelID, Editor.requireIpcEvent);

            var frameEL = new frameCtor();
            if ( panelInfo.icon ) {
                frameEL.icon = new Image();
                frameEL.icon.src = Path.join( panelInfo.path, panelInfo.icon );
            }
            frameEL.setAttribute('id', panelID);
            frameEL.setAttribute('name', panelInfo.title);
            frameEL.classList.add('fit');
            frameEL.tabIndex = 1;

            // set size attribute
            if ( panelInfo.width )
                frameEL.setAttribute( 'width', panelInfo.width );

            if ( panelInfo.height )
                frameEL.setAttribute( 'height', panelInfo.height );

            if ( panelInfo['min-width'] )
                frameEL.setAttribute( 'min-width', panelInfo['min-width'] );

            if ( panelInfo['min-height'] )
                frameEL.setAttribute( 'min-height', panelInfo['min-height'] );

            if ( panelInfo['max-width'] )
                frameEL.setAttribute( 'max-width', panelInfo['max-width'] );

            if ( panelInfo['max-height'] )
                frameEL.setAttribute( 'max-height', panelInfo['max-height'] );

            // register ipc events
            var ipcListener = new Editor.IpcListener();

            // always have panel:open message
            if ( panelInfo.messages.indexOf('panel:open') === -1 ) {
                panelInfo.messages.push('panel:open');
            }

            for ( var i = 0; i < panelInfo.messages.length; ++i ) {
                _registerIpc( panelID, frameEL, ipcListener, panelInfo.messages[i] );
            }

            //
            _idToPagePanelInfo[panelID] = {
                frameEL: frameEL,
                messages: panelInfo.messages,
                ipcListener: ipcListener,
                popable: panelInfo.popable,
            };

            // register profiles
            frameEL.profiles = panelInfo.profiles;
            for ( var type in panelInfo.profiles ) {
                _registerProfile ( panelID, type, panelInfo.profiles[type] );
            }

            // register shortcuts
            // TODO: load overwrited shortcuts from profile?
            if ( panelInfo.shortcuts ) {
                var mousetrap = new Mousetrap(frameEL);
                for ( var shortcut in panelInfo.shortcuts ) {
                    var methodName = panelInfo.shortcuts[shortcut];
                    var fn = frameEL[methodName];
                    if ( typeof fn === 'function' ) {
                        mousetrap.bind(shortcut, fn.bind(frameEL) );
                    }
                    else {
                        Editor.warn('Failed to register shortcut for method %s in panel %s, can not find it.', methodName, panelID );
                    }
                }
            }

            // done
            cb ( null, frameEL, panelInfo );
        });
    });
};

Panel.open = function ( panelID, argv ) {
    Editor.sendToCore('panel:open', panelID, argv);
};

Panel.popup = function ( panelID ) {
    var panelCounts = 0;
    for ( var id in _idToPagePanelInfo ) {
        ++panelCounts;
    }

    if ( panelCounts > 1 ) {
        Panel.close(panelID);
        Editor.sendToCore('panel:open', panelID);
    }
};

Panel.close = function ( panelID ) {
    Panel.undock(panelID);
    Editor.sendToCore('panel:close', panelID);
};

Panel.closeAll = function () {
    for ( var id in _idToPagePanelInfo ) {
        Panel.close(id);
    }
};

Panel.undock = function ( panelID ) {
    // remove panel element from tab
    var frameEL = Editor.Panel.find(panelID);
    if ( frameEL ) {
        var parentEL = Polymer.dom(frameEL).parentNode;
        if ( parentEL instanceof EditorUI.Panel ) {
            var currentTabEL = parentEL.$.tabs.findTab(frameEL);
            parentEL.close(currentTabEL);
        }
        else {
            Polymer.dom(parentEL).removeChild(frameEL);
        }

        EditorUI.DockUtils.flush();
        Editor.saveLayout();
    }

    // remove pagePanelInfo
    var pagePanelInfo = _idToPagePanelInfo[panelID];
    if ( pagePanelInfo) {
        pagePanelInfo.ipcListener.clear();
        delete _idToPagePanelInfo[panelID];
    }
};

Panel.dispatch = function ( panelID, ipcName ) {
    var pagePanelInfo = _idToPagePanelInfo[panelID];
    if ( !pagePanelInfo ) {
        Editor.warn( 'Failed to receive ipc %s, can not find panel %s', ipcName, panelID);
        return;
    }

    // messages
    var idx = pagePanelInfo.messages.indexOf(ipcName);
    if ( idx === -1 ) {
        Editor.warn('Can not find ipc message %s register in panel %s', ipcName, panelID );
        return;
    }

    if ( ipcName === 'panel:open' ) {
        Panel.focus(panelID);
    }

    var fn = pagePanelInfo.frameEL[ipcName];
    if ( !fn || typeof fn !== 'function' ) {
        if ( ipcName !== 'panel:open') {
            Editor.warn('Failed to respond ipc message %s in panel %s, Can not find implementation', ipcName, panelID );
        }
        return;
    }
    var args = [].slice.call( arguments, 2 );
    fn.apply( pagePanelInfo.frameEL, args );
};

Panel.dumpLayout = function () {
    var root = EditorUI.DockUtils.root;
    if ( !root )
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

Panel.find = function ( panelID ) {
    var pagePanelInfo = _idToPagePanelInfo[panelID];
    if ( !pagePanelInfo ) {
        return null;
    }
    return pagePanelInfo.frameEL;
};

Panel.focus = function ( panelID ) {
    var frameEL = Panel.find(panelID);
    var parentEL = Polymer.dom(frameEL).parentNode;
    if ( parentEL instanceof EditorUI.Panel ) {
        parentEL.select(frameEL);
        parentEL.focus();
    }
};

Panel.getPanelInfo = function ( panelID ) {
    return _idToPagePanelInfo[panelID];
};

// position: top, bottom, left, right, top-left, top-right, bottom-left, bottom-right
Panel.dockAt = function ( position, panelEL ) {
    var root = EditorUI.DockUtils.root;
    if ( !root ) {
        return null;
    }

    if ( !root['ui-dockable'] ) {
        return null;
    }

    // TODO
};

Panel.isDirty = function ( panelID ) {
    return _dirtyPanels.indexOf(panelID) !== -1;
};

// ==========================
// Ipc events
// ==========================

var Ipc = require('ipc');

Ipc.on('panel:close', function ( panelID ) {
    // NOTE: if we don't do this in requestAnimationFrame,
    // the tab will remain, something wrong for Polymer.dom
    // operation when they are in ipc callback.
    window.requestAnimationFrame( function () {
        Editor.Panel.close(panelID);
    });
});

Ipc.on('panel:popup', function ( panelID ) {
    window.requestAnimationFrame( function () {
        Editor.Panel.close(panelID);
        Editor.sendToCore('panel:open', panelID);
    });
});

Ipc.on('panel:undock', function ( panelID ) {
    window.requestAnimationFrame( function () {
        Editor.Panel.undock(panelID);
    });
});

var _dirtyPanels = [];
Ipc.on('panel:dirty', function ( panelID ) {
    var frameEL = Editor.Panel.find(panelID);
    if ( frameEL ) {
        var parentEL = Polymer.dom(frameEL).parentNode;
        if ( parentEL instanceof EditorUI.Panel ) {
            parentEL.warn(frameEL);
        }
    }

    if ( _dirtyPanels.indexOf(panelID) === -1 ) {
        _dirtyPanels.push(panelID);
    }
});

module.exports = Panel;
