EditorUI.dockable = (function () {
    var dockable = {
        'ui-dockable': true,

        _dragoverAction: function ( event ) {
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
            var lightDOM = Polymer.dom(this);
            var parentEL = lightDOM.parentNode;
            var parentDOM = Polymer.dom(parentEL);
            var elements = [];
            var newDock, newDockDOM, newResizer, nextEL;

            if ( parentEL['ui-dockable'] ) {
                // check if need to create new Dock element
                if ( position === 'left' || position === 'right' ) {
                    if ( !parentEL.row ) {
                        needNewDock = true;
                    }
                }
                else {
                    if ( parentEL.row ) {
                        needNewDock = true;
                    }
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
                    newDock.finalizeSize(elements);
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
                if ( this._applyViewSize )
                    this._applyViewSize();
            }
            // if this is root panel
            else {
                if ( position === 'left' || position === 'right' ) {
                    if ( !this.row ) {
                        needNewDock = true;
                    }
                }
                else {
                    if ( this.row ) {
                        needNewDock = true;
                    }
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

                    while ( this.children.length > 0 ) {
                        var childEL = this.children[0];
                        elements.push(childEL);
                        newDockDOM.appendChild(childEL);
                    }

                    newDock.style.flex = this.style.flex;
                    newDock.finalizeSize(elements);
                    newDock.curWidth = this.curWidth;
                    newDock.curHeight = this.curHeight;

                    // reset old panel's computed width, height
                    this.style.flex = '';
                    if ( this._applyViewSize )
                        this._applyViewSize();

                    //
                    if ( position === 'left' || position === 'top' ) {
                        lightDOM.appendChild(element);
                        lightDOM.appendChild(newDock);
                    }
                    else {
                        lightDOM.appendChild(newDock);
                        lightDOM.appendChild(element);
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
                            lightDOM.appendChild(newResizer);
                            lightDOM.appendChild(element);
                        }
                        else {
                            lightDOM.insertBefore(newResizer, nextEL);
                            lightDOM.insertBefore(element, nextEL);
                        }
                    }
                }
            }
        },

        removeDock: function ( childEL ) {
            if ( !this.contains(childEL) )
                return false;

            if ( this.firstElementChild === childEL ) {
                if ( childEL.nextElementSibling &&
                     childEL.nextElementSibling instanceof EditorUI.DockResizer )
                {
                    childEL.nextElementSibling.remove();
                }
            }
            else {
                if ( childEL.previousElementSibling &&
                     childEL.previousElementSibling instanceof EditorUI.DockResizer )
                {
                    childEL.previousElementSibling.remove();
                }
            }
            childEL.remove();

            // return if dock can be collapsed
            return this.collapse();
        },

        collapse: function () {
            if ( this['no-collapse'] )
                return false;

            var parentEL = Polymer.dom(this).parentNode;
            var parentDOM = Polymer.dom(parentEL);

            // if we don't have any element in this panel
            if ( this.children.length === 0 ) {
                if ( parentEL['ui-dockable'] ) {
                    parentEL.removeDock(this);
                }
                else {
                    this.remove();
                }

                return true;
            }


            // if we only have one element in this panel
            if ( this.children.length === 1 ) {
                var childEL = this.children[0];

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
                this.remove();

                if ( childEL['ui-dockable'] ) {
                    childEL.collapse();
                }

                return true;
            }

            // if the parent dock direction is same as this panel
            if ( parentEL['ui-dockable'] && parentEL.row === this.row ) {
                while ( this.children.length > 0 ) {
                    parentDOM.insertBefore( this.children[0], this );
                }
                this.remove();

                return true;
            }

            return false;
        },
    };
    return dockable;
})();
