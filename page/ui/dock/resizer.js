(function () {

function _resize ( elementList, vertical, offset,
                   sizeList, resizerIndex,
                   prevTotalSize, prevMinSize, prevMaxSize,
                   nextTotalSize, nextMinSize, nextMaxSize
                   ) {
    var expectSize, newPrevSize, newNextSize;
    var prevOffset, nextOffset;
    var prevIndex, nextIndex;
    var dir = Math.sign(offset);

    if ( dir > 0 ) {
        prevIndex = resizerIndex - 1;
        nextIndex = resizerIndex + 1;
    }
    else {
        prevIndex = resizerIndex + 1;
        nextIndex = resizerIndex - 1;
    }

    prevOffset = offset;

    // prev
    var prevEL = elementList[prevIndex];
    var prevSize = sizeList[prevIndex];

    expectSize = prevSize + prevOffset * dir;
    if ( vertical )
        newPrevSize = prevEL.calcWidth(expectSize);
    else
        newPrevSize = prevEL.calcHeight(expectSize);

    prevOffset = (newPrevSize - prevSize) * dir;

    // next
    var nextEL = elementList[nextIndex];
    var nextSize = sizeList[nextIndex];

    while (1) {
        expectSize = nextSize - prevOffset * dir;
        if ( vertical )
            newNextSize = nextEL.calcWidth(expectSize);
        else
            newNextSize = nextEL.calcHeight(expectSize);

        nextOffset = (newNextSize - nextSize) * dir;

        nextEL.style.flex = "0 0 " + newNextSize + "px";

        if ( newNextSize - expectSize === 0 ) {
            break;
        }

        //
        prevOffset += nextOffset;

        //
        if ( dir > 0 ) {
            nextIndex += 2;
            if ( nextIndex >= elementList.length ) {
                break;
            }
        }
        else {
            nextIndex -= 2;
            if ( nextIndex < 0 ) {
                break;
            }
        }

        nextEL = elementList[nextIndex];
        nextSize = sizeList[nextIndex];
    }

    // re-calculate newPrevSize
    if ( dir > 0 ) {
        if ( nextTotalSize - offset * dir <= nextMinSize ) {
            prevOffset = (nextTotalSize - nextMinSize) * dir;
            newPrevSize = prevSize + prevOffset * dir;
        }
    }
    else {
        if ( prevTotalSize - offset * dir <= prevMinSize ) {
            prevOffset = (prevTotalSize - prevMinSize) * dir;
            newPrevSize = prevSize + prevOffset * dir;
        }
    }

    //
    prevEL.style.flex = "0 0 " + newPrevSize + "px";

    for ( var i = 0; i < elementList.length; ++i ) {
        var el = elementList[i];
        if ( el instanceof EditorUI.DockResizer )
            continue;

        el._notifyResize();
    }
}

EditorUI.DockResizer = Polymer({
    is: 'editor-dock-resizer',

    listeners: {
        'mousedown': '_onMouseDown'
    },

    properties: {
        vertical: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },

        active: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
    },

    ready: function () {
        if ( Editor.isWin32 ) {
            this.classList.add('platform-win');
        }
    },

    _snapshot: function () {
        var thisDOM = Polymer.dom(this);
        var parentEL = thisDOM.parentNode;
        var parentDOM = Polymer.dom(parentEL);

        var rect;
        var sizeList = [];
        var i, resizerIndex = -1;
        // var totalSize = -1;

        // get parent size
        var frameWrapper = parentEL.$['frame-wrapper'];
        if ( frameWrapper ) {
            rect = frameWrapper.getBoundingClientRect();
        }
        else {
            rect = parentEL.getBoundingClientRect();
        }
        // totalSize = this.vertical ? rect.width : rect.height;

        // get element size
        for ( i = 0; i < parentDOM.children.length; ++i ) {
            var el = parentDOM.children[i];
            if ( el === this ) {
                resizerIndex = i;
            }

            rect = el.getBoundingClientRect();
            sizeList.push( Math.round(this.vertical ? rect.width : rect.height) );
        }

        //
        var prevTotalSize = 0;
        var prevMinSize = 0;
        var prevMaxSize = 0;
        var nextTotalSize = 0;
        var nextMinSize = 0;
        var nextMaxSize = 0;

        for ( i = 0; i < resizerIndex; i += 2 ) {
            prevTotalSize += sizeList[i];
            prevMinSize +=
                this.vertical ?
                parentDOM.children[i].computedMinWidth :
                parentDOM.children[i].computedMinHeight;

            prevMaxSize +=
                this.vertical ?
                parentDOM.children[i].computedMaxWidth :
                parentDOM.children[i].computedMaxHeight;
        }

        for ( i = resizerIndex+1; i < parentDOM.children.length; i += 2 ) {
            nextTotalSize += sizeList[i];
            nextMinSize +=
                this.vertical ?
                parentDOM.children[i].computedMinWidth :
                parentDOM.children[i].computedMinHeight;

            nextMaxSize +=
                this.vertical ?
                parentDOM.children[i].computedMaxWidth :
                parentDOM.children[i].computedMaxHeight;
        }

        return {
            sizeList: sizeList,
            resizerIndex: resizerIndex,
            prevTotalSize: prevTotalSize,
            prevMinSize: prevMinSize,
            prevMaxSize: prevMaxSize,
            nextTotalSize: nextTotalSize,
            nextMinSize: nextMinSize,
            nextMaxSize: nextMaxSize,
        };
    },

    _onMouseDown: function ( event ) {
        //
        event.stopPropagation();

        var thisDOM = Polymer.dom(this);
        var parentEL = thisDOM.parentNode;
        var parentDOM = Polymer.dom(parentEL);

        //
        this.active = true;
        var snapshot = this._snapshot();
        var lastDir = 0;
        var rect = this.getBoundingClientRect();
        var centerx = Math.round(rect.left + rect.width/2);
        var centery = Math.round(rect.top + rect.height/2);

        for ( var i = 0; i < parentDOM.children.length; ++i ) {
            var el = parentDOM.children[i];
            if ( el instanceof EditorUI.DockResizer )
                continue;

            el.style.flex = "0 0 " + snapshot.sizeList[i] + "px";
        }

        // mousemove
        var mousemoveHandle = function (event) {
            event.stopPropagation();

            var expectSize, newPrevSize, newNextSize;
            var offset, prevOffset, nextOffset;

            // get offset
            if ( this.vertical ) {
                offset = event.clientX - centerx;
            }
            else {
                offset = event.clientY - centery;
            }

            //
            if ( offset !== 0 ) {
                rect = this.getBoundingClientRect();
                var curx = Math.round(rect.left + rect.width/2);
                var cury = Math.round(rect.top + rect.height/2);
                var delta;
                if ( this.vertical ) {
                    delta = event.clientX - curx;
                }
                else {
                    delta = event.clientY - cury;
                }
                var curDir = Math.sign(delta);

                if ( lastDir !== 0 && lastDir !== curDir ) {
                    snapshot = this._snapshot();
                    centerx = curx;
                    centery = cury;
                    offset = delta;
                }
                lastDir = curDir;

                _resize( parentDOM.children,
                         this.vertical,
                         offset,
                         snapshot.sizeList,
                         snapshot.resizerIndex,
                         snapshot.prevTotalSize,
                         snapshot.prevMinSize,
                         snapshot.prevMaxSize,
                         snapshot.nextTotalSize,
                         snapshot.nextMinSize,
                         snapshot.nextMaxSize
                         );
            }
        }.bind(this);

        // mouseup
        var mouseupHandle = function(event) {
            event.stopPropagation();

            document.removeEventListener('mousemove', mousemoveHandle);
            document.removeEventListener('mouseup', mouseupHandle);
            EditorUI.removeDragGhost();

            this.active = false;

            var thisDOM = Polymer.dom(this);
            var parentEL = thisDOM.parentNode;
            var parentDOM = Polymer.dom(parentEL);

            // get elements' size
            parentEL._reflowRecursively();

            // notify resize
            for ( i = 0; i < parentDOM.children.length; ++i ) {
                el = parentDOM.children[i];
                if ( el instanceof EditorUI.DockResizer )
                    continue;

                el._notifyResize();
            }

            //
            Editor.saveLayout();
        }.bind(this);

        // add drag-ghost
        if ( Editor.isWin32 ) {
            EditorUI.addDragGhost( this.vertical ? 'ew-resize' : 'ns-resize' );
        }
        else {
            EditorUI.addDragGhost( this.vertical ? 'col-resize' : 'row-resize' );
        }
        document.addEventListener ( 'mousemove', mousemoveHandle );
        document.addEventListener ( 'mouseup', mouseupHandle );
    },
});

})();
