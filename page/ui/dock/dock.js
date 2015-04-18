(function () {

EditorUI.Dock = Polymer( EditorUI.mixin({
    is: 'editor-dock',

    // TODO: we have to use EditorUI.mixin polyfill until polymer support
    //       mixin properties, observers and so on.
    // mixins: [EditorUI.resizable, EditorUI.focusable, EditorUI.dockable],

    properties: {
        'row': {
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

        window.requestAnimationFrame( function () {
            if ( !EditorUI.DockUtils.root ) {
                var lightDOM = Polymer.dom(this);
                var isRootDock = this['no-collapse'] && !lightDOM.parentNode['ui-dockable'];
                if ( isRootDock ) {
                    EditorUI.DockUtils.root = this;
                    this._finalizeSizeRecursively();
                    this._finalizeMinMaxRecursively();
                    this._finalizeStyleRecursively();
                    this._notifyResize();
                }
            }
        }.bind(this));
    },

    _initResizers: function () {
        var lightDOM = Polymer.dom(this);
        if ( lightDOM.children.length > 1 ) {
            for ( var i = 0; i < lightDOM.children.length; ++i ) {
                if ( i != lightDOM.children.length-1 ) {
                    var el = lightDOM.children[i];

                    var resizer = new EditorUI.DockResizer();
                    resizer.vertical = this.row;

                    lightDOM.insertBefore( resizer, el.nextElementSibling );
                    i += 1;
                }
            }
        }
    },

    // depth first calculate the width and height
    _finalizeSizeRecursively: function () {
        var elements = [];
        var lightDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < lightDOM.children.length; i += 2 ) {
            var el = lightDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._finalizeSizeRecursively();
                elements.push(el);
            }
        }

        //
        this.finalizeSize(elements);
    },

    // depth first calculate the min max width and height
    _finalizeMinMaxRecursively: function () {
        var elements = [];
        var lightDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < lightDOM.children.length; i += 2 ) {
            var el = lightDOM.children[i];
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
        var lightDOM = Polymer.dom(this);

        //
        for ( var i = 0; i < lightDOM.children.length; i += 2 ) {
            var el = lightDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._finalizeStyleRecursively();
            }
        }

        //
        this.finalizeStyle();
        this.reflow();
    },

    _reflowRecursively: function () {
        var lightDOM = Polymer.dom(this);

        for ( var i = 0; i < lightDOM.children.length; i += 2 ) {
            var el = lightDOM.children[i];
            if ( el['ui-dockable'] ) {
                el._reflowRecursively();
            }
        }
        this.reflow();
    },

    finalizeStyle: function () {
        // var resizerCnt = (this.children.length - 1)/2;
        // var resizerSize = resizerCnt * resizerSpace;

        var lightDOM = Polymer.dom(this);
        var i, el, size;
        var hasAutoLayout = false;

        if ( lightDOM.children.length === 1 ) {
            el = lightDOM.children[0];

            el.style.flex = "1 1 auto";
            hasAutoLayout = true;
        }
        else {
            for ( i = 0; i < lightDOM.children.length; i += 2 ) {
                el = lightDOM.children[i];

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
                    if ( i === (lightDOM.children.length-1) && !hasAutoLayout ) {
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
        var lightDOM = Polymer.dom(this);

        for ( i = 0; i < lightDOM.children.length; ++i ) {
            el = lightDOM.children[i];

            rect = el.getBoundingClientRect();
            var size = Math.floor(this.row ? rect.width : rect.height);
            sizeList.push(size);
            totalSize += size;
        }

        for ( i = 0; i < lightDOM.children.length; ++i ) {
            el = lightDOM.children[i];
            if ( el instanceof EditorUI.DockResizer )
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

}, EditorUI.resizable, EditorUI.focusable, EditorUI.dockable));

})();
