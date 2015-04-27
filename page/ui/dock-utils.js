EditorUI.DockUtils = (function () {

    var _resizerSpace = 3; // 3 is resizer size
    var _resultDock = null;
    var _potentialDocks = [];
    var _dockMask = null;

    var _dragenterCnt = 0;
    var _draggingInfo = null;

    if ( Editor.isApp ) {
        var Ipc = require('ipc');

        Ipc.on( 'panel:dragstart', function ( info ) {
            _draggingInfo = info;
        });
        Ipc.on( 'panel:dragend', function () {
            _reset();
        });
        Ipc.on( 'panel:drop', function ( panelID ) {
            // close panel
            var viewEL = Editor.Panel.find(panelID);
            if ( viewEL ) {
                var panelEL = Polymer.dom(viewEL).parentNode;
                var currentTabEL = panelEL.$.tabs.find(viewEL);
                panelEL.close(currentTabEL);
                Editor.Panel.close(panelID);
            }
        });

    }

    var _updateMask = function ( type, x, y, w, h ) {
        if ( !_dockMask ) {
            // add dock mask
            _dockMask = document.createElement('div');
            _dockMask.style.pointerEvents = 'none';
            _dockMask.style.zIndex = '999';
            _dockMask.style.position = 'fixed';
            _dockMask.style.boxSizing = 'border-box';
            _dockMask.oncontextmenu = function() { return false; };
        }

        if ( type === 'dock' ) {
            _dockMask.style.background = 'rgba(0,128,255,0.3)';
            _dockMask.style.border = '2px solid rgb(0,128,255)';
        }
        else if ( type === 'tab' ) {
            _dockMask.style.background = 'rgba(255,128,0,0.15)';
            _dockMask.style.border = '';
        }

        _dockMask.style.left = x + 'px';
        _dockMask.style.top = y + 'px';
        _dockMask.style.width = w + 'px';
        _dockMask.style.height = h + 'px';

        if ( !_dockMask.parentElement ) {
            document.body.appendChild(_dockMask);
        }
    };

    var _reset = function () {
        if ( _dockMask ) {
            _dockMask.remove();
        }

        _resultDock = null;
        _dragenterCnt = 0;
        _draggingInfo = null;
    };

    var DockUtils = {};

    DockUtils.root = null;

    DockUtils.dragstart = function ( dataTransfer, tabEL ) {
        dataTransfer.setData('editor/type', 'tab');

        var panelID = tabEL.viewEL.getAttribute('id');
        var panelEL = Polymer.dom(tabEL).parentNode.panelEL;
        var panelRect = panelEL.getBoundingClientRect();

        _draggingInfo = {
            panelID: panelID,
            panelEL: panelEL,
            panelRectWidth: panelRect.width,
            panelRectHeight: panelRect.height,
        };

        if ( Editor.sendToWindows ) {
            Editor.sendToWindows('panel:dragstart', _draggingInfo, Editor.selfExcluded);
        }
    };

    DockUtils.dragoverTab = function ( target ) {
        if ( !_draggingInfo )
            return;

        // clear docks hints
        _potentialDocks = [];
        if ( _dockMask ) {
            _dockMask.remove();
        }
        _resultDock = null;


        var rect = target.getBoundingClientRect();
        _updateMask ( 'tab', rect.left, rect.top, rect.width, rect.height+4 );
    };

    DockUtils.dropTab = function ( target, insertBeforeTabEL ) {
        if ( !_draggingInfo )
            return;

        var panelID = _draggingInfo.panelID;
        var viewEL = Editor.Panel.find(panelID);

        if ( viewEL ) {
            var panelEL = _draggingInfo.panelEL;
            var needCollapse = panelEL !== target.panelEL;
            var currentTabEL = panelEL.$.tabs.find(viewEL);

            if ( needCollapse ) {
                panelEL.closeNoCollapse(currentTabEL);
            }

            //
            var newPanel = target.panelEL;
            var idx = newPanel.insert( currentTabEL, viewEL, insertBeforeTabEL );
            newPanel.select(idx);

            if ( needCollapse ) {
                panelEL.collapse();
            }

            //
            DockUtils.flush();

            // reset internal states
            _reset();
        }
        else {
            // TODO: we need to make sure panel undocked first, sendToCore('panel:close', panelID) ???
            if ( Editor.sendToWindows ) {
                Editor.sendToWindows( 'panel:drop', panelID, Editor.selfExcluded );
            }
            Editor.sendRequestToCore('panel:query-info', panelID, function ( panelInfo ) {
                var Path = require('fire-path');
                var viewPath = Path.join( panelInfo.path, panelInfo.view );

                Editor.Panel.load( viewPath, panelID, panelInfo, function ( err, viewEL ) {
                    var newPanel = target.panelEL;
                    var newTabEL = new EditorUI.Tab(viewEL.getAttribute('name'));
                    var idx = newPanel.insert( newTabEL, viewEL, insertBeforeTabEL );
                    newPanel.select(idx);

                    //
                    DockUtils.flush();

                    // reset internal states
                    _reset();
                });
            });
        }
    };

    DockUtils.dragoverDock = function ( target ) {
        if ( !_draggingInfo )
            return;

        _potentialDocks.push(target);
    };

    DockUtils.reset = function () {
        if ( DockUtils.root['ui-dockable'] ) {
            this.root._finalizeSizeRecursively();
            this.root._finalizeMinMaxRecursively();
            this.root._finalizeStyleRecursively();
            this.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    DockUtils.flush = function () {
        Polymer.dom.flush();
        if ( DockUtils.root['ui-dockable'] ) {
            this.root._finalizeMinMaxRecursively();
            this.root._finalizeStyleRecursively();
            this.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    DockUtils.reflow = function () {
        if ( DockUtils.root['ui-dockable'] ) {
            DockUtils.root._reflowRecursively();
            DockUtils.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    window.addEventListener('resize', function() {
        DockUtils.reflow();
    });

    document.addEventListener('dragenter', function ( event ) {
        if ( !_draggingInfo )
            return;

        event.stopPropagation();
        ++_dragenterCnt;
    });

    document.addEventListener('dragleave', function ( event ) {
        if ( !_draggingInfo )
            return;

        event.stopPropagation();
        --_dragenterCnt;

        if ( _dragenterCnt === 0 ) {
            if ( _dockMask ) {
                _dockMask.remove();
            }
        }
    });

    document.addEventListener('dragover', function ( event ) {
        if ( !_draggingInfo )
            return;

        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();

        var minDistance = null;
        _resultDock = null;

        for ( var i = 0; i < _potentialDocks.length; ++i ) {
            var hintTarget = _potentialDocks[i];
            var targetRect = hintTarget.getBoundingClientRect();
            var center_x = targetRect.left + targetRect.width/2;
            var center_y = targetRect.top + targetRect.height/2;
            var pos = null;

            var leftDist = Math.abs(event.x - targetRect.left);
            var rightDist = Math.abs(event.x - targetRect.right);
            var topDist = Math.abs(event.y - targetRect.top);
            var bottomDist = Math.abs(event.y - targetRect.bottom);
            var minEdge = 100;
            var distanceToEdgeCenter = -1;

            if ( leftDist < minEdge ) {
                minEdge = leftDist;
                distanceToEdgeCenter = Math.abs(event.y - center_y);
                pos = 'left';
            }

            if ( rightDist < minEdge ) {
                minEdge = rightDist;
                distanceToEdgeCenter = Math.abs(event.y - center_y);
                pos = 'right';
            }

            if ( topDist < minEdge ) {
                minEdge = topDist;
                distanceToEdgeCenter = Math.abs(event.x - center_x);
                pos = 'top';
            }

            if ( bottomDist < minEdge ) {
                minEdge = bottomDist;
                distanceToEdgeCenter = Math.abs(event.x - center_x);
                pos = 'bottom';
            }

            //
            if ( pos !== null && (minDistance === null || distanceToEdgeCenter < minDistance) ) {
                minDistance = distanceToEdgeCenter;
                _resultDock = { target: hintTarget, position: pos };
            }
        }

        if ( _resultDock ) {
            var rect = _resultDock.target.getBoundingClientRect();
            var maskRect = null;

            var panelEL = _draggingInfo.panelEL;
            var panelRectWidth = _draggingInfo.panelRectWidth;
            var panelRectHeight = _draggingInfo.panelRectHeight;

            var hintWidth = panelEL.computedWidth === 'auto' ? rect.width/2 : panelRectWidth;
            hintWidth = Math.min( hintWidth, Math.min( rect.width/2, 200 ) );

            var hintHeight = panelEL.computedHeight === 'auto' ? rect.height/2 : panelRectHeight;
            hintHeight = Math.min( hintHeight, Math.min( rect.height/2, 200 ) );

            if ( _resultDock.position === 'top' ) {
                maskRect = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: hintHeight,
                };
            }
            else if ( _resultDock.position === 'bottom' ) {
                maskRect = {
                    left: rect.left,
                    top: rect.bottom-hintHeight,
                    width: rect.width,
                    height: hintHeight
                };
            }
            else if ( _resultDock.position === 'left' ) {
                maskRect = {
                    left: rect.left,
                    top: rect.top,
                    width: hintWidth,
                    height: rect.height
                };
            }
            else if ( _resultDock.position === 'right' ) {
                maskRect = {
                    left: rect.right-hintWidth,
                    top: rect.top,
                    width: hintWidth,
                    height: rect.height
                };
            }

            //
            _updateMask ( 'dock', maskRect.left, maskRect.top, maskRect.width, maskRect.height );
        }
        else {
            if ( _dockMask )
                _dockMask.remove();
        }

        _potentialDocks = [];
    });

    document.addEventListener('dragend', function ( event ) {
        // reset internal states
        _reset();
        if ( Editor.sendToWindows ) {
            Editor.sendToWindows( 'panel:dragend', Editor.selfExcluded );
        }
    });

    document.addEventListener('drop', function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        if ( _resultDock === null ) {
            return;
        }
        var viewEL = Editor.Panel.find(_draggingInfo.panelID);
        if ( !viewEL ) {
            // TODO
            // if ( Editor.sendToWindows ) {
            //     Editor.sendToWindows( 'panel:drop', _draggingInfo.panelID, Editor.selfExcluded );
            // }
            return;
        }

        var panelEL = Polymer.dom(viewEL).parentNode;

        if ( _resultDock.target === panelEL &&
             _resultDock.target.tabCount === 1 )
        {
            return;
        }

        var panelDOM = Polymer.dom(panelEL);

        var panelRectWidth = _draggingInfo.panelRectWidth;
        var panelRectHeight = _draggingInfo.panelRectHeight;
        var parentDock = panelDOM.parentNode;

        //
        var currentTabEL = panelEL.$.tabs.find(viewEL);
        panelEL.closeNoCollapse(currentTabEL);

        //
        var newPanel = new EditorUI.Panel();
        newPanel['min-width'] = panelEL['min-width'];
        newPanel['max-width'] = panelEL['max-width'];
        newPanel['min-height'] = panelEL['min-height'];
        newPanel['max-height'] = panelEL['max-height'];
        newPanel.width = panelEL.width;
        newPanel.height = panelEL.height;

        // NOTE: here must use viewEL's width, height attribute to determine computed size
        var elWidth = parseInt(viewEL.getAttribute('width'));
        elWidth = isNaN(elWidth) ? 'auto' : elWidth;
        newPanel.computedWidth = elWidth === 'auto' ? 'auto' : panelEL.computedWidth;

        var elHeight = parseInt(viewEL.getAttribute('height'));
        elHeight = isNaN(elHeight) ? 'auto' : elHeight;
        newPanel.computedHeight = elHeight === 'auto' ? 'auto' : panelEL.computedHeight;

        // if parent is row, the height will be ignore
        if ( parentDock.row ) {
            newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelRectWidth;
            newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelEL.curHeight;
        }
        // else if parent is column, the width will be ignore
        else {
            newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelEL.curWidth;
            newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelRectHeight;
        }

        newPanel.add(viewEL);
        newPanel.select(0);

        //
        _resultDock.target.addDock( _resultDock.position, newPanel );

        //
        var totallyRemoved = panelDOM.children.length === 0;
        panelEL.collapse();

        // if we totally remove the panelEL, check if targetDock has the ancient as panelEL does
        // if that is true, add parentEL's size to targetDock's flex style size
        if ( totallyRemoved ) {
            var hasSameAncient = false;
            var newPanelDOM = Polymer.dom(newPanel);

            // if newPanel and oldPanel have the same parent, don't do the calculation.
            // it means newPanel just move under the same parent dock in same direction.
            if ( newPanelDOM.parentNode !== parentDock ) {
                var sibling = newPanel;
                var newParent = newPanelDOM.parentNode;
                while ( newParent && newParent['ui-dockable'] ) {
                    if ( newParent === parentDock ) {
                        hasSameAncient = true;
                        break;
                    }

                    sibling = newParent;
                    newParent = Polymer.dom(newParent).parentNode;
                }

                if ( hasSameAncient ) {
                    var size = 0;
                    if ( parentDock.row ) {
                        size = sibling.curWidth + _resizerSpace + panelEL.curWidth;
                        sibling.curWidth = size;
                    }
                    else {
                        size = sibling.curHeight + _resizerSpace + panelEL.curHeight;
                        sibling.curHeight = size;
                    }

                    sibling.style.flex = '0 0 '  + size + 'px';
                }
            }
        }

        //
        DockUtils.flush();

        // reset internal states
        _reset();
    });

    return DockUtils;
})();

