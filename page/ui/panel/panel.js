(function () {

EditorUI.Panel = Polymer(EditorUI.mixin({
    is: 'editor-panel',

    // TODO: we have to use EditorUI.mixin polyfill until polymer support
    //       mixin properties, observers and so on.
    // mixins: [EditorUI.resizable, EditorUI.focusable, EditorUI.dockable],

    properties: {
        width: { type: String, value: '200', },
        height: { type: String, value: '200', },
        minWidth: { type: String, value: '200', },
        minHeight: { type: String, value: '200', },
    },

    listeners: {
        'mousedown': '_onMouseDown',
    },

    ready: function () {
        this._initFocusable(null); // NOTE: panel's focus element is variable (a.k.a viewEL)
        this._initResizable();
        this._initTabs();

        var mousetrap = new Mousetrap(this);
        mousetrap.bind(['command+shift+]','ctrl+tab'], function () {
            var next = this.activeIndex+1;
            if ( next >= this.tabCount )
                next = 0;
            this.select(next);
        }.bind(this));
        mousetrap.bind(['command+shift+[','ctrl+shift+tab'], function () {
            var prev = this.activeIndex-1;
            if ( prev < 0 )
                prev = this.tabCount-1;
            this.select(prev);
        }.bind(this));
    },

    _onMouseDown: function ( event ) {
        if ( event.which === 1 ) {
            event.stopPropagation();
            this.focus();
        }
    },

    focus: function () {
        this.activeTab.viewEL.focus();
    },

    blur: function () {
        this.activeTab.viewEL.blur();
    },

    _initTabs: function () {
        var thisDOM = Polymer.dom(this);

        //
        var tabs = this.$.tabs;
        tabs.panelEL = this;

        //
        for ( var i = 0; i < thisDOM.children.length; ++i ) {
            var el = thisDOM.children[i];

            //
            var name = el.getAttribute('name');
            var tabEL = tabs.addTab(name);
            tabEL.setAttribute('draggable', 'true');

            el.style.display = 'none';
            tabEL.viewEL = el;
            tabEL.setIcon( el.icon );
        }

        tabs.select(0);
    },

    _collapseRecursively: function () {
        this.collapse();
    },

    _finalizeSizeRecursively: function () {
        this._applyViewSize();
    },

    _finalizeMinMaxRecursively: function () {
        this._applyViewMinMax();
    },

    _finalizeStyleRecursively: function () {
        this._applyStyle();
    },

    _reflowRecursively: function () {
    },

    _applyViewSize: function () {
        var thisDOM = Polymer.dom(this);
        var autoWidth = false, autoHeight = false;

        // reset width, height
        this.computedWidth = this.width;
        this.computedHeight = this.height;

        for ( var i = 0; i < thisDOM.children.length; ++i ) {
            var el = thisDOM.children[i];

            // width
            var elWidth = parseInt(el.getAttribute('width'));
            elWidth = isNaN(elWidth) ? 'auto' : elWidth;

            if ( autoWidth || elWidth === 'auto' ) {
                autoWidth = true;
                this.computedWidth = 'auto';
            }
            else {
                if ( this.width === 'auto' || elWidth > this.computedWidth ) {
                    this.computedWidth = elWidth;
                }
            }

            // height
            var elHeight = parseInt(el.getAttribute('height'));
            elHeight = isNaN(elHeight) ? 'auto' : elHeight;

            if ( autoHeight || elHeight === 'auto' ) {
                autoHeight = true;
                this.computedHeight = 'auto';
            }
            else {
                if ( this.height === 'auto' || elHeight > this.computedHeight ) {
                    this.computedHeight = elHeight;
                }
            }
        }

        //
        this.curWidth = this.computedWidth;
        this.curHeight = this.computedHeight;
    },

    _applyViewMinMax: function () {
        var thisDOM = Polymer.dom(this);
        var infWidth = false, infHeight = false;

        for ( var i = 0; i < thisDOM.children.length; ++i ) {
            var el = thisDOM.children[i];

            // NOTE: parseInt('auto') will return NaN, it will return false in if check

            // min-width
            var minWidth = parseInt(el.getAttribute('min-width'));
            if ( minWidth ) {
                if ( this.minWidth === 'auto' || minWidth > this.minWidth ) {
                    this.computedMinWidth = minWidth;
                }
            }

            // min-height
            var minHeight = parseInt(el.getAttribute('min-height'));
            if ( minHeight ) {
                if ( this.minHeight === 'auto' || minHeight > this.minHeight ) {
                    this.computedMinHeight = minHeight;
                }
            }

            // max-width
            var maxWidth = parseInt(el.getAttribute('max-width'));
            maxWidth = isNaN(maxWidth) ? 'auto' : maxWidth;
            if ( infWidth || maxWidth === 'auto' ) {
                infWidth = true;
                this.computedMaxWidth = 'auto';
            }
            else {
                if ( this.maxWidth === 'auto' ) {
                    infWidth = true;
                }
                else if ( maxWidth && maxWidth > this.maxWidth ) {
                    this.computedMaxWidth = maxWidth;
                }
            }

            // max-height
            var maxHeight = parseInt(el.getAttribute('max-height'));
            maxHeight = isNaN(maxHeight) ? 'auto' : maxHeight;
            if ( infHeight || maxHeight === 'auto' ) {
                infHeight = true;
                this.computedMaxHeight = 'auto';
            }
            else {
                if ( this.maxHeight === 'auto' ) {
                    infHeight = true;
                }
                else if ( maxHeight && maxHeight > this.maxHeight ) {
                    this.computedMaxHeight = maxHeight;
                }
            }
        }
    },

    _applyStyle: function () {
        // min-width
        if ( this.computedMinWidth !== 'auto' ) {
            this.style.minWidth = this.computedMinWidth + 'px';
        }
        else {
            this.style.minWidth = 'auto';
        }

        // max-width
        if ( this.computedMaxWidth !== 'auto' ) {
            this.style.maxWidth = this.computedMaxWidth + 'px';
        }
        else {
            this.style.maxWidth = 'auto';
        }

        // min-height
        if ( this.computedMinHeight !== 'auto' ) {
            this.style.minHeight = this.computedMinHeight + 'px';
        }
        else {
            this.style.minHeight = 'auto';
        }

        // max-height
        if ( this.computedMaxHeight !== 'auto' ) {
            this.style.maxHeight = this.computedMaxHeight + 'px';
        }
        else {
            this.style.maxHeight = 'auto';
        }
    },

    get activeTab () {
        return this.$.tabs.activeTab;
    },

    get activeIndex () {
        return EditorUI.index(this.$.tabs.activeTab);
    },

    get tabCount () {
        return Polymer.dom(this.$.tabs).children.length;
    },

    select: function ( idxOrViewEL ) {
        var tabs = this.$.tabs;
        if ( typeof idxOrViewEL === 'number' ) {
            tabs.select(idxOrViewEL);
        }
        else {
            var thisDOM = Polymer.dom(this);
            for ( var i = 0; i < thisDOM.children.length; ++i ) {
                if ( idxOrViewEL === thisDOM.children[i] ) {
                    tabs.select(i);
                    break;
                }
            }
        }
    },

    insert: function ( tabEL, viewEL, insertBeforeTabEL ) {
        var thisDOM = Polymer.dom(this);
        var tabDOM = Polymer.dom(tabEL);
        var tabs = this.$.tabs;

        var name = viewEL.getAttribute('name');
        tabs.insertTab(tabEL, insertBeforeTabEL);
        tabEL.setAttribute('draggable', 'true');

        // NOTE: if we just move tabs, we must not hide viewEL
        if ( tabDOM.parentNode !== tabs ) {
            viewEL.style.display = 'none';
        }
        tabEL.viewEL = viewEL;
        tabEL.setIcon( viewEL.icon ); // TEMP HACK

        //
        if ( insertBeforeTabEL ) {
            thisDOM.insertBefore(viewEL, insertBeforeTabEL.viewEL);
        }
        else {
            thisDOM.appendChild(viewEL);
        }

        //
        this._applyViewMinMax();
        this._applyStyle();

        return EditorUI.index(tabEL);
    },

    add: function ( viewEL ) {
        var thisDOM = Polymer.dom(this);
        var tabs = this.$.tabs;

        var name = viewEL.getAttribute('name');
        var tabEL = tabs.addTab(name);
        tabEL.setAttribute('draggable', 'true');

        viewEL.style.display = 'none';
        tabEL.viewEL = viewEL;
        tabEL.setIcon( viewEL.icon ); // TEMP HACK

        thisDOM.appendChild(viewEL);

        //
        this._applyViewMinMax();
        this._applyStyle();

        //
        return thisDOM.children.length - 1;
    },

    closeNoCollapse: function ( tabEL ) {
        var tabs = this.$.tabs;

        //
        tabs.removeTab(tabEL);
        if ( tabEL.viewEL ) {
            var panelDOM = Polymer.dom(Polymer.dom(tabEL.viewEL).parentNode);
            panelDOM.removeChild(tabEL.viewEL);
            tabEL.viewEL = null;
        }

        //
        this._applyViewMinMax();
        this._applyStyle();
    },

    close: function ( tabEL ) {
        this.closeNoCollapse(tabEL);
        this.collapse();
    },

    collapse: function () {
        var thisDOM = Polymer.dom(this);
        var tabsDOM = Polymer.dom(this.$.tabs);

        // remove from dock;
        if ( tabsDOM.children.length === 0 ) {
            if ( thisDOM.parentNode['ui-dockable'] ) {
                return thisDOM.parentNode.removeDock(this);
            }
        }

        return false;
    },

    _onTabChanged: function ( event ) {
        var detail = event.detail;
        if ( detail.old !== null ) {
            detail.old.viewEL.style.display = 'none';
            detail.old.viewEL.dispatchEvent( new CustomEvent('panel-hide') );
        }
        if ( detail.new !== null ) {
            detail.new.viewEL.style.display = '';
            detail.new.viewEL.dispatchEvent( new CustomEvent('panel-show') );
        }

        event.stopPropagation();
    },
}, EditorUI.resizable, EditorUI.focusable, EditorUI.dockable));

})();
