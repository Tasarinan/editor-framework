EditorUI.DockUtils = (function () {

    var _resizerSpace = 3; // 3 is resizer size
    var _resultDock = null;
    var _potentialDocks = [];
    var _dockMask = null;

    var _dragenterCnt = 0;
    var _draggingInfo = null;

    if ( Editor.isNative ) {
        var Ipc = require('ipc');

        Ipc.on( 'panel:dragstart', function ( info ) {
            _draggingInfo = info;
        });
        Ipc.on( 'panel:dragend', function () {
            _reset();
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

        var frameEL = tabEL.frameEL;
        var panelID = frameEL.getAttribute('id');
        var panelEL = Polymer.dom(frameEL).parentNode;
        var panelRect = panelEL.getBoundingClientRect();

        _draggingInfo = {
            panelID: panelID,
            panelRectWidth: panelRect.width,
            panelRectHeight: panelRect.height,

            panelWidth: panelEL.width,
            panelHeight: panelEL.height,
            panelComputedWidth: panelEL.computedWidth,
            panelComputedHeight: panelEL.computedHeight,
            panelCurWidth: panelEL.curWidth,
            panelCurHeight: panelEL.curHeight,

            panelMinWidth: panelEL.minWidth,
            panelMinHeight: panelEL.minHeight,
            panelMaxWidth: panelEL.maxWidth,
            panelMaxHeight: panelEL.maxHeight,

            parentDockRow: Polymer.dom(panelEL).parentNode.row,
        };

        if ( Editor.sendToWindows ) {
            Editor.sendToWindows('panel:dragstart', _draggingInfo, Editor.selfExcluded);
        }
    };

    DockUtils.getFrameSize = function ( frameEL, prop ) {
        var sizeAttr = frameEL.getAttribute(prop);
        if ( sizeAttr !== 'auto' ) {
            sizeAttr = parseInt(sizeAttr);
            sizeAttr = isNaN(sizeAttr) ? 200 : sizeAttr;
        }
        return sizeAttr;
    };

    DockUtils.dragoverTab = function ( target ) {
        if ( !_draggingInfo )
            return;

        Editor.Window.focus();

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
        var frameEL = Editor.Panel.find(panelID);

        if ( frameEL ) {
            var panelEL = Polymer.dom(frameEL).parentNode;
            var targetPanelEL = target.panelEL;

            var needCollapse = panelEL !== targetPanelEL;
            var currentTabEL = panelEL.$.tabs.findTab(frameEL);

            if ( needCollapse ) {
                panelEL.closeNoCollapse(currentTabEL);
            }

            //
            var idx = targetPanelEL.insert( currentTabEL, frameEL, insertBeforeTabEL );
            targetPanelEL.select(idx);

            if ( needCollapse ) {
                panelEL.collapse();
            }

            // reset internal states
            _reset();

            //
            DockUtils.flush();
            Editor.saveLayout();

            // NOTE: you must focus after DockUtils flushed
            // NOTE: do not use panelEL focus, the activeTab is still not assigned
            frameEL.focus();
            if ( Editor.Panel.isDirty(frameEL.getAttribute('id')) ) {
                targetPanelEL.outOfDate(frameEL);
            }
        }
        else {
            Editor.Panel.close(panelID);

            Editor.Panel.load( panelID, function ( err, frameEL ) {
                if ( err ) {
                    return;
                }

                requestAnimationFrame ( function () {
                    var targetPanelEL = target.panelEL;
                    var newTabEL = new EditorUI.Tab(frameEL.getAttribute('name'));
                    var idx = targetPanelEL.insert( newTabEL, frameEL, insertBeforeTabEL );
                    targetPanelEL.select(idx);

                    // reset internal states
                    _reset();

                    //
                    DockUtils.flush();
                    Editor.saveLayout();

                    // NOTE: you must focus after DockUtils flushed
                    // NOTE: do not use panelEL focus, the activeTab is still not assigned
                    frameEL.focus();
                    if ( Editor.Panel.isDirty(frameEL.getAttribute('id')) ) {
                        targetPanelEL.outOfDate(frameEL);
                    }
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
        Polymer.dom.flush();

        if ( !DockUtils.root )
            return;

        if ( DockUtils.root['ui-dockable'] ) {
            this.root._finalizeSizeRecursively(true);
            this.root._finalizeMinMaxRecursively();
            this.root._finalizeStyleRecursively();
            this.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    DockUtils.flushWithCollapse = function () {
        this.root._collapseRecursively();
        Polymer.dom.flush();

        if ( !DockUtils.root )
            return;

        if ( DockUtils.root['ui-dockable'] ) {
            this.root._finalizeSizeRecursively(false);
            this.root._finalizeMinMaxRecursively();
            this.root._finalizeStyleRecursively();
            this.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    DockUtils.flush = function () {
        Polymer.dom.flush();

        if ( !DockUtils.root )
            return;

        if ( DockUtils.root['ui-dockable'] ) {
            this.root._finalizeMinMaxRecursively();
            this.root._finalizeStyleRecursively();
            this.root._notifyResize();
        } else {
            DockUtils.root.dispatchEvent( new CustomEvent('resize') );
        }
    };

    DockUtils.reflow = function () {
        if ( !DockUtils.root )
            return;

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

        Editor.Window.focus();

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

            var panelComputedWidth = _draggingInfo.panelComputedWidth;
            var panelComputedHeight = _draggingInfo.panelComputedHeight;
            var panelRectWidth = _draggingInfo.panelRectWidth;
            var panelRectHeight = _draggingInfo.panelRectHeight;

            var hintWidth = panelComputedWidth === 'auto' ? rect.width/2 : panelRectWidth;
            hintWidth = Math.min( hintWidth, Math.min( rect.width/2, 200 ) );

            var hintHeight = panelComputedHeight === 'auto' ? rect.height/2 : panelRectHeight;
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

        var panelID = _draggingInfo.panelID;
        var panelRectWidth = _draggingInfo.panelRectWidth;
        var panelRectHeight = _draggingInfo.panelRectHeight;

        var panelWidth = _draggingInfo.panelWidth;
        var panelHeight = _draggingInfo.panelHeight;
        var panelComputedWidth = _draggingInfo.panelComputedWidth;
        var panelComputedHeight = _draggingInfo.panelComputedHeight;
        var panelCurWidth = _draggingInfo.panelCurWidth;
        var panelCurHeight = _draggingInfo.panelCurHeight;

        var panelMinWidth = _draggingInfo.panelMinWidth;
        var panelMinHeight = _draggingInfo.panelMinHeight;
        var panelMaxWidth = _draggingInfo.panelMaxWidth;
        var panelMaxHeight = _draggingInfo.panelMaxHeight;

        var parentDockRow = _draggingInfo.parentDockRow;

        var targetDockEL = _resultDock.target;
        var dockPosition = _resultDock.position;

        var frameEL = Editor.Panel.find(panelID);
        if ( !frameEL ) {
            Editor.Panel.close(panelID);

            Editor.Panel.load( panelID, function ( err, frameEL ) {
                if ( err ) {
                    return;
                }

                requestAnimationFrame ( function () {
                    var newPanel = new EditorUI.Panel();
                    newPanel.width = panelWidth;
                    newPanel.height = panelHeight;
                    newPanel.minWidth = panelMinWidth;
                    newPanel.maxWidth = panelMaxWidth;
                    newPanel.minHeight = panelMinHeight;
                    newPanel.maxHeight = panelMaxHeight;

                    // NOTE: here must use frameEL's width, height attribute to determine computed size
                    var elWidth = EditorUI.DockUtils.getFrameSize( frameEL, 'width');
                    newPanel.computedWidth = elWidth === 'auto' ? 'auto' : panelComputedWidth;

                    var elHeight = EditorUI.DockUtils.getFrameSize( frameEL, 'height');
                    newPanel.computedHeight = elHeight === 'auto' ? 'auto' : panelComputedHeight;

                    // if parent is row, the height will be ignore
                    if ( parentDockRow ) {
                        newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelRectWidth;
                        newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelCurHeight;
                    }
                    // else if parent is column, the width will be ignore
                    else {
                        newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelCurWidth;
                        newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelRectHeight;
                    }

                    newPanel.add(frameEL);
                    newPanel.select(0);

                    //
                    targetDockEL.addDock( dockPosition, newPanel );

                    // reset internal states
                    _reset();

                    //
                    DockUtils.flush();
                    Editor.saveLayout();

                    // NOTE: you must focus after DockUtils flushed
                    // NOTE: do not use panelEL focus, the activeTab is still not assigned
                    frameEL.focus();
                    if ( Editor.Panel.isDirty(frameEL.getAttribute('id')) ) {
                        newPanel.outOfDate(frameEL);
                    }
                });
            });

            return;
        }

        var panelEL = Polymer.dom(frameEL).parentNode;

        if ( targetDockEL === panelEL &&
             targetDockEL.tabCount === 1 )
        {
            return;
        }

        var panelDOM = Polymer.dom(panelEL);
        var parentDock = panelDOM.parentNode;

        //
        var currentTabEL = panelEL.$.tabs.findTab(frameEL);
        panelEL.closeNoCollapse(currentTabEL);

        //
        var newPanel = new EditorUI.Panel();
        newPanel.width = panelWidth;
        newPanel.height = panelHeight;
        newPanel.minWidth = panelMinWidth;
        newPanel.maxWidth = panelMaxWidth;
        newPanel.minHeight = panelMinHeight;
        newPanel.maxHeight = panelMaxHeight;

        // NOTE: here must use frameEL's width, height attribute to determine computed size
        var elWidth = EditorUI.DockUtils.getFrameSize( frameEL, 'width');
        newPanel.computedWidth = elWidth === 'auto' ? 'auto' : panelComputedWidth;

        var elHeight = EditorUI.DockUtils.getFrameSize( frameEL, 'height');
        newPanel.computedHeight = elHeight === 'auto' ? 'auto' : panelComputedHeight;

        // if parent is row, the height will be ignore
        if ( parentDock.row ) {
            newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelRectWidth;
            newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelCurHeight;
        }
        // else if parent is column, the width will be ignore
        else {
            newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelCurWidth;
            newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelRectHeight;
        }

        newPanel.add(frameEL);
        newPanel.select(0);

        //
        targetDockEL.addDock( dockPosition, newPanel );

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
                        size = sibling.curWidth + _resizerSpace + panelCurWidth;
                        sibling.curWidth = size;
                    }
                    else {
                        size = sibling.curHeight + _resizerSpace + panelCurHeight;
                        sibling.curHeight = size;
                    }

                    sibling.style.flex = '0 0 '  + size + 'px';
                }
            }
        }

        // reset internal states
        _reset();

        //
        DockUtils.flush();
        Editor.saveLayout();

        // NOTE: you must focus after DockUtils flushed
        // NOTE: do not use panelEL focus, the activeTab is still not assigned
        frameEL.focus();
        if ( Editor.Panel.isDirty(frameEL.getAttribute('id')) ) {
            newPanel.outOfDate(frameEL);
        }
    });

    return DockUtils;
})();

