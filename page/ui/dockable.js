EditorUI.dockable = (function () {
    var _resizerSpace = 3; // 3 is resizer size

    var dockable = {
        'ui-dockable': true,

        listeners: {
            'dragover': '_onDragOver',
        },

        _onDragOver: function ( event ) {
            event.preventDefault();

            EditorUI.DockUtils.dragoverDock( event.currentTarget );
        },

        // position: left, right, top, bottom
        addDock: function ( position, element ) {
            if ( element['ui-dockable'] === false ) {
                Editor.warn('Dock element must be dockable');
                return;
            }

            var needNewDock = false;
            var thisDOM = Polymer.dom(this);
            var parentEL = thisDOM.parentNode;
            var parentDOM = Polymer.dom(parentEL);
            var elements = [];
            var newDock, newDockDOM, newResizer, nextEL;
            var newWidth, newHeight;
            var rect = this.getBoundingClientRect();

            if ( parentEL['ui-dockable'] ) {
                // check if need to create new Dock element
                if ( position === 'left' || position === 'right' ) {
                    if ( !parentEL.row ) {
                        needNewDock = true;
                    }
                    newWidth = Math.max( 0, rect.width-element.curWidth-_resizerSpace );
                }
                else {
                    if ( parentEL.row ) {
                        needNewDock = true;
                    }
                    newHeight = Math.max( 0, rect.height-element.curHeight-_resizerSpace );
                }

                // process dock
                if ( needNewDock ) {
                    // new EditorUI.Dock
                    newDock = new EditorUI.Dock();
                    newDockDOM = Polymer.dom(newDock);

                    if ( position === 'left' || position === 'right' ) {
                        newDock.row = true;
                    }
                    else {
                        newDock.row = false;
                    }

                    //
                    parentDOM.insertBefore(newDock, this);

                    //
                    if ( position === 'left' || position === 'top' ) {
                        newDockDOM.appendChild(element);
                        newDockDOM.appendChild(this);
                        elements = [element,this];
                    }
                    else {
                        newDockDOM.appendChild(this);
                        newDockDOM.appendChild(element);
                        elements = [this,element];
                    }

                    //
                    newDock.style.flex = this.style.flex;
                    newDock._initResizers();
                    newDock.finalizeSize(elements,true);
                    newDock.curWidth = this.curWidth;
                    newDock.curHeight = this.curHeight;
                }
                else {
                    // new resizer
                    newResizer = null;
                    newResizer = new EditorUI.DockResizer();
                    newResizer.vertical = parentEL.row;

                    //
                    if ( position === 'left' || position === 'top' ) {
                        parentDOM.insertBefore(element, this);
                        parentDOM.insertBefore(newResizer, this);
                    }
                    else {
                        // insert after
                        nextEL = this.nextElementSibling;
                        if ( nextEL === null ) {
                            parentDOM.appendChild(newResizer);
                            parentDOM.appendChild(element);
                        }
                        else {
                            parentDOM.insertBefore(newResizer, nextEL);
                            parentDOM.insertBefore(element, nextEL);
                        }
                    }
                }

                // reset old panel's computed width, height
                this.style.flex = '';
                if ( this._applyFrameSize ) {
                    this._applyFrameSize(false);
                }

                if ( position === 'left' || position === 'right' ) {
                    if ( this.computedWidth !== 'auto' )
                        this.curWidth = newWidth;
                }
                else {
                    if ( this.computedHeight !== 'auto' )
                        this.curHeight = newHeight;
                }
            }
            // if this is root panel
            else {
                if ( position === 'left' || position === 'right' ) {
                    if ( !this.row ) {
                        needNewDock = true;
                    }
                    newWidth = Math.max( 0, rect.width-element.curWidth-_resizerSpace );
                }
                else {
                    if ( this.row ) {
                        needNewDock = true;
                    }
                    newHeight = Math.max( 0, rect.height-element.curHeight-_resizerSpace );
                }

                // process dock
                if ( needNewDock ) {
                    // new EditorUI.Dock
                    newDock = new EditorUI.Dock();
                    newDockDOM = Polymer.dom(newDock);

                    newDock.row = this.row;
                    if ( position === 'left' || position === 'right' ) {
                        this.row = true;
                    }
                    else {
                        this.row = false;
                    }

                    while ( thisDOM.children.length > 0 ) {
                        var childEL = thisDOM.children[0];
                        elements.push(childEL);
                        newDockDOM.appendChild(childEL);
                    }

                    newDock.style.flex = this.style.flex;
                    newDock.finalizeSize(elements,true);
                    newDock.curWidth = this.curWidth;
                    newDock.curHeight = this.curHeight;

                    // reset old panel's computed width, height
                    this.style.flex = '';
                    if ( this._applyFrameSize ) {
                        this._applyFrameSize(false);
                    }

                    if ( position === 'left' || position === 'right' ) {
                        if ( this.computedWidth !== 'auto' )
                            this.curWidth = newWidth;
                    }
                    else {
                        if ( this.computedHeight !== 'auto' )
                            this.curHeight = newHeight;
                    }

                    //
                    if ( position === 'left' || position === 'top' ) {
                        thisDOM.appendChild(element);
                        thisDOM.appendChild(newDock);
                    }
                    else {
                        thisDOM.appendChild(newDock);
                        thisDOM.appendChild(element);
                    }

                    //
                    this.ready();
                }
                else {
                    // new resizer
                    newResizer = null;
                    newResizer = new EditorUI.DockResizer();
                    newResizer.vertical = this.row;

                    //
                    if ( position === 'left' || position === 'top' ) {
                        this.insertBefore(element, this.firstElementChild);
                        this.insertBefore(newResizer, this.firstElementChild);
                    }
                    else {
                        // insert after
                        nextEL = this.nextElementSibling;
                        if ( nextEL === null ) {
                            thisDOM.appendChild(newResizer);
                            thisDOM.appendChild(element);
                        }
                        else {
                            thisDOM.insertBefore(newResizer, nextEL);
                            thisDOM.insertBefore(element, nextEL);
                        }
                    }
                }
            }
        },

        removeDock: function ( childEL ) {
            var thisDOM = Polymer.dom(this);

            var contains = false;
            for ( var i = 0; i < thisDOM.children.length; ++i ) {
                if ( thisDOM.children[i] === childEL ) {
                    contains = true;
                    break;
                }
            }
            if ( !contains )
                return false;

            if ( thisDOM.children[0] === childEL ) {
                if ( childEL.nextElementSibling &&
                     childEL.nextElementSibling instanceof EditorUI.DockResizer )
                {
                    thisDOM.removeChild(childEL.nextElementSibling);
                }
            }
            else {
                if ( childEL.previousElementSibling &&
                     childEL.previousElementSibling instanceof EditorUI.DockResizer )
                {
                    thisDOM.removeChild(childEL.previousElementSibling);
                }
            }
            thisDOM.removeChild(childEL);

            // return if dock can be collapsed
            return this.collapse();
        },

        collapse: function () {
            if ( this.noCollapse )
                return false;

            var thisDOM = Polymer.dom(this);
            var parentEL = thisDOM.parentNode;
            var parentDOM = Polymer.dom(parentEL);

            // if we don't have any element in this panel
            if ( thisDOM.children.length === 0 ) {
                if ( parentEL['ui-dockable'] ) {
                    parentEL.removeDock(this);
                }
                else {
                    parentDOM.removeChild(this);
                }

                return true;
            }


            // if we only have one element in this panel
            if ( thisDOM.children.length === 1 ) {
                var childEL = thisDOM.children[0];

                // assign current style to it, also reset its computedSize
                childEL.style.flex = this.style.flex;
                if ( parentEL.row ) {
                    childEL.curWidth = this.curWidth;
                    childEL.curHeight = childEL.computedHeight === 'auto' ? 'auto' : this.curHeight;
                }
                else {
                    childEL.curWidth = childEL.computedWidth === 'auto' ? 'auto' : this.curWidth;
                    childEL.curHeight = this.curHeight;
                }

                parentDOM.insertBefore( childEL, this );
                parentDOM.removeChild(this);

                if ( childEL['ui-dockable'] ) {
                    childEL.collapse();
                }

                return true;
            }

            // if the parent dock direction is same as this panel
            if ( parentEL['ui-dockable'] && parentEL.row === this.row ) {
                while ( thisDOM.children.length > 0 ) {
                    parentDOM.insertBefore( thisDOM.children[0], this );
                }
                parentDOM.removeChild(this);

                return true;
            }

            return false;
        },
    };
    return dockable;
})();
