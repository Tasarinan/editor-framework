EditorUI.DockUtils = (function () {

    var _resultDock = null;
    var _potentialDocks = [];
    var _dockMask = null;
    var _draggingTab = null;

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
        _draggingTab = null;
    };

    var DockUtils = {};

    DockUtils.root = null;

    DockUtils.dragstart = function ( dataTransfer, tabEL ) {
        _draggingTab = tabEL;
        dataTransfer.setData('fire/type', 'tab');
    };

    DockUtils.dragoverTab = function ( target ) {
        if ( _draggingTab === null )
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
        var viewEL = _draggingTab.viewEL;
        var panelEL = _draggingTab.parentElement.panel;
        var needCollapse = panelEL !== target.panel;

        if ( needCollapse ) {
            panelEL.closeNoCollapse(_draggingTab);
        }

        //
        var newPanel = target.panel;
        var idx = newPanel.insert( _draggingTab, viewEL, insertBeforeTabEL );
        newPanel.select(idx);

        if ( needCollapse ) {
            panelEL.collapse();
        }

        //
        DockUtils.flush();

        // reset internal states
        _reset();
    };

    DockUtils.dragoverDock = function ( target ) {
        if ( _draggingTab === null )
            return;

        _potentialDocks.push(target);
    };

    DockUtils.reset = function () {
        this.root._finalizeSizeRecursively();
        this.root._finalizeMinMaxRecursively();
        this.root._finalizeStyleRecursively();
        this.root._notifyResize();
    };

    DockUtils.flush = function () {
        this.root._finalizeMinMaxRecursively();
        this.root._finalizeStyleRecursively();
        this.root._notifyResize();
    };

    DockUtils.reflow = function () {
        DockUtils.root._reflowRecursively();
        DockUtils.root._notifyResize();
    };

    window.addEventListener('resize', function() {
        DockUtils.reflow();
    });

    document.addEventListener("dragover", function ( event ) {
        if ( _draggingTab === null )
            return;

        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();

        var panelEL = _draggingTab.parentElement.panel;
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
            var hintWidth = panelEL.computedWidth === 'auto' ? rect.width/2 : panelEL.curWidth;
            hintWidth = Math.min( hintWidth, Math.min( rect.width/2, 200 ) );

            var hintHeight = panelEL.computedHeight === 'auto' ? rect.height/2 : panelEL.curHeight;
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

    document.addEventListener("dragend", function ( event ) {
        // reset internal states
        _reset();
    });

    document.addEventListener("drop", function ( event ) {
        if ( _resultDock === null ) {
            return;
        }

        if ( _resultDock.target === _draggingTab.parentElement.panel &&
             _resultDock.target.tabCount === 1 )
        {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var viewEL = _draggingTab.viewEL;
        var panelEL = _draggingTab.parentElement.panel;

        var panelRect = panelEL.getBoundingClientRect();
        var parentDock = panelEL.parentElement;

        //
        panelEL.closeNoCollapse(_draggingTab);

        //
        var newPanel = new FirePanel();
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

        newPanel.curWidth = newPanel.computedWidth === 'auto' ? 'auto' : panelRect.width;
        newPanel.curHeight = newPanel.computedHeight === 'auto' ? 'auto' : panelRect.height;

        newPanel.add(viewEL);
        newPanel.select(0);

        //
        _resultDock.target.addDock( _resultDock.position, newPanel );

        //
        var totallyRemoved = panelEL.children.length === 0;
        panelEL.collapse();

        // if we totally remove the panelEL, check if targetDock has the ancient as panelEL does
        // if that is true, add parentEL's size to targetDock's flex style size
        if ( totallyRemoved ) {
            var hasSameAncient = false;

            // if newPanel and oldPanel have the same parent, don't do the calculation.
            // it means newPanel just move under the same parent dock in same direction.
            if ( newPanel.parentElement !== parentDock ) {
                var sibling = newPanel;
                var newParent = newPanel.parentElement;
                while ( newParent && newParent instanceof FireDock ) {
                    if ( newParent === parentDock ) {
                        hasSameAncient = true;
                        break;
                    }

                    sibling = newParent;
                    newParent = newParent.parentElement;
                }

                if ( hasSameAncient ) {
                    var size = 0;
                    if ( parentDock.row ) {
                        // 3 is resizer size
                        size = sibling.curWidth + 3 + panelEL.curWidth;
                        sibling.curWidth = size;
                    }
                    else {
                        // 3 is resizer size
                        size = sibling.curHeight + 3 + panelEL.curHeight;
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

