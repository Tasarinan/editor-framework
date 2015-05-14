(function () {

EditorUI.Dock = Polymer({
    is: 'editor-dock',

    behaviors: [EditorUI.resizable, EditorUI.dockable],

    properties: {
        row: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },

        noCollapse: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
    },

    ready: function () {
        this._initResizable();
        this._initResizers();
    },

    factoryImpl: function ( row, noCollapse ) {
        this.row = row || false;
        this.noCollapse = noCollapse || false;
    },

    _initResizers: function () {
        var thisDOM = Polymer.dom(this);
        if ( thisDOM.children.length > 1 ) {
            for ( var i = 0; i < thisDOM.children.length; ++i ) {
                if ( i != thisDOM.children.length-1 ) {
                    var el = thisDOM.children[i];
                    var nextEL = thisDOM.children[i+1];

                    var resizer = new EditorUI.DockResizer();
                    resizer.vertical = this.row;

                    thisDOM.insertBefore( resizer, nextEL );
                    i += 1;
                }
            }
        }
    },

    _collapseRecursively: function () {
        var elements = [];
        var thisDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < thisDOM.children.length; i += 2 ) {
            var el = thisDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._collapseRecursively();
            }
        }

        this.collapse();
    },

    // depth first calculate the width and height
    _finalizeSizeRecursively: function ( reset ) {
        var elements = [];
        var thisDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < thisDOM.children.length; i += 2 ) {
            var el = thisDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._finalizeSizeRecursively(reset);
                elements.push(el);
            }
        }

        //
        this.finalizeSize(elements,reset);
    },

    // depth first calculate the min max width and height
    _finalizeMinMaxRecursively: function () {
        var elements = [];
        var thisDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < thisDOM.children.length; i += 2 ) {
            var el = thisDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._finalizeMinMaxRecursively();
                elements.push(el);
            }
        }

        //
        this.finalizeMinMax(elements, this.row);
    },

    _finalizeStyleRecursively: function () {
        var elements = [];
        var thisDOM = Polymer.dom(this);

        // NOTE: finalizeStyle is breadth first calculation, because we need to make sure
        //       parent style applied so that the children would not calculate wrong.
        this.finalizeStyle();

        //
        for ( var i = 0; i < thisDOM.children.length; i += 2 ) {
            var el = thisDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._finalizeStyleRecursively();
            }
        }

        //
        this.reflow();
    },

    _reflowRecursively: function () {
        var thisDOM = Polymer.dom(this);

        for ( var i = 0; i < thisDOM.children.length; i += 2 ) {
            var el = thisDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._reflowRecursively();
            }
        }
        this.reflow();
    },

    finalizeStyle: function () {
        // var resizerCnt = (thisDOM.children.length - 1)/2;
        // var resizerSize = resizerCnt * resizerSpace;

        var thisDOM = Polymer.dom(this);
        var i, el, size;
        var hasAutoLayout = false;

        if ( thisDOM.children.length === 1 ) {
            el = thisDOM.children[0];

            el.style.flex = "1 1 auto";
            hasAutoLayout = true;
        }
        else {
            for ( i = 0; i < thisDOM.children.length; i += 2 ) {
                el = thisDOM.children[i];

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
                    // // if this is last el and we don't have auto-layout elements, give rest size to last el
                    // if ( i === (thisDOM.children.length-1) && !hasAutoLayout ) {
                    //     el.style.flex = "1 1 auto";
                    // }
                    // else {
                    //     el.style.flex = "0 0 " + size + "px";
                    // }
                    el.style.flex = "0 0 " + size + "px";
                }
            }
        }
    },

    reflow: function () {
        var i, rect, el;
        var parentRect;
        var sizeList = [];
        var totalSize = 0;
        var thisDOM = Polymer.dom(this);

        parentRect = this.getBoundingClientRect();

        for ( i = 0; i < thisDOM.children.length; ++i ) {
            el = thisDOM.children[i];

            rect = el.getBoundingClientRect();
            var size = Math.round(this.row ? rect.width : rect.height);
            sizeList.push(size);
            totalSize += size;
        }

        for ( i = 0; i < thisDOM.children.length; ++i ) {
            el = thisDOM.children[i];
            if ( el instanceof EditorUI.DockResizer )
                continue;

            var ratio = sizeList[i]/totalSize;
            el.style.flex = ratio + " " + ratio + " " + sizeList[i] + "px";

            if ( this.row ) {
                el.curWidth = sizeList[i];
                // el.curHeight = parentRect.height; // DISABLE, disable this can store the last used height
            }
            else {
                // el.curWidth = parentRect.width; // DISABLE, disable this can store the last used height
                el.curHeight = sizeList[i];
            }
        }
    },

});

})();
