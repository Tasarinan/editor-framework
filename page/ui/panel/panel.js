(function () {

EditorUI.Panel = Polymer({
    is: 'editor-panel',

    behaviors: [ EditorUI.resizable, EditorUI.focusable, EditorUI.dockable ],

    properties: {
        width: { type: String, value: '200', },
        height: { type: String, value: '200', },
        minWidth: { type: String, value: '200', },
        minHeight: { type: String, value: '200', },
    },

    ready: function () {
        this._initFocusable(null); // NOTE: panel's focus element is variable (a.k.a frameEL)
        this._initResizable();
        this._initTabs();

        var mousetrap = new Mousetrap(this);
        mousetrap.bind(['command+shift+]','ctrl+tab'], function () {
            var next = this.activeIndex+1;
            if ( next >= this.tabCount )
                next = 0;
            this.select(next);
            this.focus();
        }.bind(this));
        mousetrap.bind(['command+shift+[','ctrl+shift+tab'], function () {
            var prev = this.activeIndex-1;
            if ( prev < 0 )
                prev = this.tabCount-1;
            this.select(prev);
            this.focus();
        }.bind(this));

        // grab mousedown in capture phase to make sure we focus on it
        this.addEventListener('mousedown', function (event) {
            if ( event.which === 1 ) {
                this.focus();
            }
        }, true);
    },

    _onMouseDown: function ( event ) {
        if ( event.which === 1 ) {
            event.stopPropagation();
            this.focus();
        }
    },

    focus: function () {
        if ( this.activeTab ) {
            this.activeTab.frameEL.focus();
        }
    },

    blur: function () {
        if ( this.activeTab ) {
            this.activeTab.frameEL.blur();
        }
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
            tabEL.frameEL = el;
            tabEL.setIcon( el.icon );
        }

        tabs.select(0);
    },

    _collapseRecursively: function () {
        this.collapse();
    },

    _finalizeSizeRecursively: function ( reset ) {
        this._applyFrameSize(reset);
    },

    _finalizeMinMaxRecursively: function () {
        this._applyFrameMinMax();
    },

    _finalizeStyleRecursively: function () {
        this._applyStyle();
    },

    _reflowRecursively: function () {
    },

    _applyFrameSize: function ( reset ) {
        var thisDOM = Polymer.dom(this);
        var autoWidth = false, autoHeight = false;

        // reset width, height
        this.computedWidth = this.width;
        this.computedHeight = this.height;

        for ( var i = 0; i < thisDOM.children.length; ++i ) {
            var el = thisDOM.children[i];

            // width
            var elWidth = EditorUI.DockUtils.getFrameSize( el, 'width' );
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
            var elHeight = EditorUI.DockUtils.getFrameSize( el, 'height' );
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

        if ( reset ) {
            this.curWidth = this.computedWidth;
            this.curHeight = this.computedHeight;
        }
        // if reset is false, we just reset the part that
        else {
            if ( thisDOM.parentNode.row ) {
                this.curHeight = this.computedHeight;
            }
            else {
                this.curWidth = this.computedWidth;
            }
        }
    },

    _applyFrameMinMax: function () {
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

    warn: function ( idxOrFrameEL ) {
        var tabs = this.$.tabs;
        if ( typeof idxOrFrameEL === 'number' ) {
            tabs.warn(idxOrFrameEL);
        }
        else {
            var thisDOM = Polymer.dom(this);
            for ( var i = 0; i < thisDOM.children.length; ++i ) {
                if ( idxOrFrameEL === thisDOM.children[i] ) {
                    tabs.warn(i);
                    break;
                }
            }
        }
    },

    select: function ( idxOrFrameEL ) {
        var tabs = this.$.tabs;
        if ( typeof idxOrFrameEL === 'number' ) {
            tabs.select(idxOrFrameEL);
        }
        else {
            var thisDOM = Polymer.dom(this);
            for ( var i = 0; i < thisDOM.children.length; ++i ) {
                if ( idxOrFrameEL === thisDOM.children[i] ) {
                    tabs.select(i);
                    break;
                }
            }
        }
    },

    insert: function ( tabEL, frameEL, insertBeforeTabEL ) {
        var thisDOM = Polymer.dom(this);
        var tabDOM = Polymer.dom(tabEL);
        var tabs = this.$.tabs;

        var name = frameEL.getAttribute('name');
        tabs.insertTab(tabEL, insertBeforeTabEL);
        tabEL.setAttribute('draggable', 'true');

        // NOTE: if we just move tabs, we must not hide frameEL
        if ( tabDOM.parentNode !== tabs ) {
            frameEL.style.display = 'none';
        }
        tabEL.frameEL = frameEL;
        tabEL.setIcon( frameEL.icon );

        //
        if ( insertBeforeTabEL ) {
            if ( frameEL !== insertBeforeTabEL.frameEL ) {
                thisDOM.insertBefore(frameEL, insertBeforeTabEL.frameEL);
            }
        }
        else {
            thisDOM.appendChild(frameEL);
        }

        //
        this._applyFrameMinMax();
        this._applyStyle();

        return EditorUI.index(tabEL);
    },

    add: function ( frameEL ) {
        var thisDOM = Polymer.dom(this);
        var tabs = this.$.tabs;

        var name = frameEL.getAttribute('name');
        var tabEL = tabs.addTab(name);
        tabEL.setAttribute('draggable', 'true');

        frameEL.style.display = 'none';
        tabEL.frameEL = frameEL;
        tabEL.setIcon( frameEL.icon );

        thisDOM.appendChild(frameEL);

        //
        this._applyFrameMinMax();
        this._applyStyle();

        //
        return thisDOM.children.length - 1;
    },

    closeNoCollapse: function ( tabEL ) {
        var tabs = this.$.tabs;

        //
        tabs.removeTab(tabEL);
        if ( tabEL.frameEL ) {
            var panelDOM = Polymer.dom(Polymer.dom(tabEL.frameEL).parentNode);
            panelDOM.removeChild(tabEL.frameEL);
            tabEL.frameEL = null;
        }

        //
        this._applyFrameMinMax();
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
        event.stopPropagation();

        var detail = event.detail;
        if ( detail.old !== null ) {
            detail.old.frameEL.style.display = 'none';
            detail.old.frameEL.dispatchEvent( new CustomEvent('panel-hide') );
        }
        if ( detail.new !== null ) {
            detail.new.frameEL.style.display = '';
            detail.new.frameEL.dispatchEvent( new CustomEvent('panel-show') );
        }

        Editor.saveLayout();
    },
});

})();
