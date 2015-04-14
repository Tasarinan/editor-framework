Editor.Panel = (function () {

    var _idToPanelInfo = {};
    var _url2link = {};

    _getPanels = function ( panelEL ) {
        var panels = [];

        for ( var i = 0; i < panelEL.childElementCount; ++i ) {
            var childEL = panelEL.children[i];
            var id = childEL.getAttribute('id');
            panels.push(id);
        }

        return panels;
    };

    _getDocks = function ( dockEL ) {
        var docks = [];

        for ( var i = 0; i < dockEL.childElementCount; ++i ) {
            var childEL = dockEL.children[i];

            if ( !(childEL instanceof FireDock) )
                continue;

            var rect = childEL.getBoundingClientRect();
            var info = {
                'row': childEL.row,
                'width': rect.width,
                'height': rect.height,
            };

            if ( childEL instanceof FirePanel ) {
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

    function _registerIpc ( ipcListener, ipcName, domEvent, viewEL ) {
        ipcListener.on( ipcName, function () {
            var detail = {};
            if ( arguments.length > 0 ) {
                detail = arguments[0];
            }
            viewEL.fire( domEvent, detail );
        } );
    }

    var Panel = {};
    Panel.root = null; // The mainDock, init by panel-init.js or main-window.js

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

        // TEST
        HTMLImports.whenReady( function () {
            cb();
        });
    };

    Panel.load = function ( url, panelID, panelInfo, cb ) {
        Panel.import(url, function () {
            var viewEL = new window[panelInfo.ctor]();
            viewEL.setAttribute('id', panelID);
            viewEL.setAttribute('name', panelInfo.title);
            viewEL.setAttribute('fit', '');

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
            for ( var ipcName in panelInfo.messages ) {
                _registerIpc( ipcListener, ipcName, panelInfo.messages[ipcName], viewEL );
            }

            //
            _idToPanelInfo[panelID] = {
                element: viewEL,
                messages: panelInfo.messages,
                ipcListener: ipcListener
            };
            Editor.sendToCore('panel:dock', panelID, Editor.requireIpcEvent);
            Editor.sendRequestToCore('panel:query-settings', {
                id: panelID,
                settings: viewEL.settings
            }, function ( settings ) {
                viewEL.settings = settings;
                viewEL.settings.save = function () {
                    Editor.sendToCore('panel:save-settings', {
                        id: panelID,
                        settings: viewEL.settings,
                    } );
                };
                cb ( null, viewEL );
            } );
        });
    };

    Panel.closeAll = function () {
        for ( var id in _idToPanelInfo ) {
            Panel.close(id);
        }
    };

    Panel.close = function ( panelID ) {
        var panelInfo = _idToPanelInfo[panelID];

        if ( panelInfo) {
            panelInfo.ipcListener.clear();
            delete _idToPanelInfo[panelID];
        }

        Editor.sendToCore('panel:undock', panelID, Editor.requireIpcEvent);
    };

    Panel.dispatch = function ( packageName, panelName, ipcMessage ) {
        var panelID = panelName + '@' + packageName;
        var panelInfo = _idToPanelInfo[panelID];
        if ( !panelInfo ) {
            Fire.warn( 'Failed to receive ipc %s, can not find panel %s', ipcMessage, panelID);
            return;
        }

        var detail;

        // special message
        if ( ipcMessage === 'panel:open' ) {
            detail = {};
            if ( arguments.length > 3 ) {
                detail = arguments[3];
            }
            panelInfo.element.fire( 'open', detail );
            return;
        }

        // other messages
        var domEvent = panelInfo.messages[ipcMessage];
        if ( domEvent ) {
            detail = {};
            if ( arguments.length > 3 ) {
                detail = arguments[3];
            }
            panelInfo.element.fire( domEvent, detail );
        }
    };

    Panel.getLayout = function () {
        if ( this.root instanceof FireDock ) {
            return {
                'type': 'dock',
                'row': this.root.row,
                'no-collapse': true,
                'docks': _getDocks(this.root),
            };
        }
        else {
            var id = this.root.getAttribute('id');
            var rect = this.root.getBoundingClientRect();

            return {
                'type': 'standalone',
                'panel': id,
                'width': rect.width,
                'height': rect.height,
            };
        }
    };

    return Panel;
})();
