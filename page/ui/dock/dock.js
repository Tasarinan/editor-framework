var resizerSpace = 3;

EditorUI.Dock = Polymer({
    is: 'editor-dock',

    mixins: [EditorUI.resizable, EditorUI.focusable],

    properties: {
        row: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },

        'no-collapse': {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
    },

    ready: function () {
        this._initFocusable(this.$.content);
        this._initResizable();
        this._initResizers();
    },

    domReady: function () {
        if ( !EditorUI.DockUtils.root ) {
            var isRootDock = this['no-collapse'] && !(this.parentElement instanceof FireDock);
            if ( isRootDock ) {
                EditorUI.DockUtils.root = this;
                this._finalizeSizeRecursively();
                this._finalizeMinMaxRecursively();
                this._finalizeStyleRecursively();
                this._notifyResize();
            }
        }
    },

    _initResizers: function () {
        if ( this.children.length > 1 ) {
            for ( var i = 0; i < this.children.length; ++i ) {
                if ( i != this.children.length-1 ) {
                    var el = this.children[i];

                    var resizer = new FireDockResizer();
                    resizer.vertical = this.row;

                    this.insertBefore( resizer, el.nextElementSibling );
                    i += 1;
                }
            }
        }
    },

    // depth first calculate the width and height
    _finalizeSizeRecursively: function () {
        var elements = [];

        //
        for ( var i = 0; i < this.children.length; i += 2 ) {
            var el = this.children[i];
            el._finalizeSizeRecursively();

            elements.push(el);
        }

        //
        this.finalizeSize(elements);
    },

    // depth first calculate the min max width and height
    _finalizeMinMaxRecursively: function () {
        var elements = [];

        //
        for ( var i = 0; i < this.children.length; i += 2 ) {
            var el = this.children[i];
            el._finalizeMinMaxRecursively();

            elements.push(el);
        }

        //
        this.finalizeMinMax(elements, this.row);
    },

    _finalizeStyleRecursively: function () {
        var elements = [];

        //
        for ( var i = 0; i < this.children.length; i += 2 ) {
            var el = this.children[i];
            el._finalizeStyleRecursively();
        }

        //
        this.finalizeStyle();
        this.reflow();
    },

    _reflowRecursively: function () {
        for ( var i = 0; i < this.children.length; i += 2 ) {
            var el = this.children[i];
            el._reflowRecursively();
        }
        this.reflow();
    },

    finalizeStyle: function () {
        // var resizerCnt = (this.children.length - 1)/2;
        // var resizerSize = resizerCnt * resizerSpace;

        var i, el, size;
        var hasAutoLayout = false;

        if ( this.children.length === 1 ) {
            el = this.children[0];

            el.style.flex = "1 1 auto";
            hasAutoLayout = true;
        }
        else {
            for ( i = 0; i < this.children.length; i += 2 ) {
                el = this.children[i];

                if ( this.row ) {
                    size = el.curWidth;
                }
                else {
                    size = el.curHeight;
                }

                if ( size === 'auto' ) {
                    hasAutoLayout = true;
                    el.style.flex = "1 1 auto";
                }
                else {
                    // if this is last el and we don't have auto-layout elements, give rest size to last el
                    if ( i === (this.children.length-1) && !hasAutoLayout ) {
                        el.style.flex = "1 1 auto";
                    }
                    else {
                        el.style.flex = "0 0 " + size + "px";
                    }
                }
            }
        }
    },

    reflow: function () {
        var i, rect, el;
        var sizeList = [];
        var totalSize = 0;

        for ( i = 0; i < this.children.length; ++i ) {
            el = this.children[i];

            rect = el.getBoundingClientRect();
            var size = Math.floor(this.row ? rect.width : rect.height);
            sizeList.push(size);
            totalSize += size;
        }

        for ( i = 0; i < this.children.length; ++i ) {
            el = this.children[i];
            if ( el instanceof FireDockResizer )
                continue;

            var ratio = sizeList[i]/totalSize;
            el.style.flex = ratio + " " + ratio + " " + sizeList[i] + "px";

            if ( this.row ) {
                el.curWidth = sizeList[i];
            }
            else {
                el.curHeight = sizeList[i];
            }
        }
    },

    // position: left, right, top, bottom
    addDock: function ( position, element ) {
        if ( element instanceof FireDock === false ) {
            Fire.warn('Dock element must be instanceof FireDock');
            return;
        }

        var needNewDock = false;
        var parentEL = this.parentElement;
        var elements = [];
        var newDock, newResizer, nextEL;

        if ( parentEL instanceof FireDock ) {
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
                // new FireDock
                newDock = new FireDock();

                if ( position === 'left' || position === 'right' ) {
                    newDock.row = true;
                }
                else {
                    newDock.row = false;
                }

                //
                parentEL.insertBefore(newDock, this);

                //
                if ( position === 'left' || position === 'top' ) {
                    newDock.appendChild(element);
                    newDock.appendChild(this);
                    elements = [element,this];
                }
                else {
                    newDock.appendChild(this);
                    newDock.appendChild(element);
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
                newResizer = new FireDockResizer();
                newResizer.vertical = parentEL.row;

                //
                if ( position === 'left' || position === 'top' ) {
                    parentEL.insertBefore(element, this);
                    parentEL.insertBefore(newResizer, this);
                }
                else {
                    // insert after
                    nextEL = this.nextElementSibling;
                    if ( nextEL === null ) {
                        parentEL.appendChild(newResizer);
                        parentEL.appendChild(element);
                    }
                    else {
                        parentEL.insertBefore(newResizer, nextEL);
                        parentEL.insertBefore(element, nextEL);
                    }
                }
            }

            // reset old panel's computed width, height
            this.style.flex = "";
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
                // new FireDock
                newDock = new FireDock();

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
                    newDock.appendChild(childEL);
                }

                newDock.style.flex = this.style.flex;
                newDock.finalizeSize(elements);
                newDock.curWidth = this.curWidth;
                newDock.curHeight = this.curHeight;

                // reset old panel's computed width, height
                this.style.flex = "";
                if ( this._applyViewSize )
                    this._applyViewSize();

                //
                if ( position === 'left' || position === 'top' ) {
                    this.appendChild(element);
                    this.appendChild(newDock);
                }
                else {
                    this.appendChild(newDock);
                    this.appendChild(element);
                }

                //
                this.ready();
            }
            else {
                // new resizer
                newResizer = null;
                newResizer = new FireDockResizer();
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
                        this.appendChild(newResizer);
                        this.appendChild(element);
                    }
                    else {
                        this.insertBefore(newResizer, nextEL);
                        this.insertBefore(element, nextEL);
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
                 childEL.nextElementSibling instanceof FireDockResizer )
            {
                childEL.nextElementSibling.remove();
            }
        }
        else {
            if ( childEL.previousElementSibling &&
                 childEL.previousElementSibling instanceof FireDockResizer )
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

        var parentEL = this.parentElement;

        // if we don't have any element in this panel
        if ( this.children.length === 0 ) {
            if ( parentEL instanceof FireDock ) {
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

            parentEL.insertBefore( childEL, this );
            this.remove();

            if ( childEL instanceof FireDock ) {
                childEL.collapse();
            }

            return true;
        }

        // if the parent dock direction is same as this panel
        if ( parentEL instanceof FireDock && parentEL.row === this.row ) {
            while ( this.children.length > 0 ) {
                parentEL.insertBefore( this.children[0], this );
            }
            this.remove();

            return true;
        }

        return false;
    },

    dragoverAction: function ( event ) {
        event.preventDefault();

        EditorUI.DockUtils.dragoverDock( event.currentTarget );
    },

});
