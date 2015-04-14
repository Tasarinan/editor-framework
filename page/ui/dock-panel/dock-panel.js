Polymer({
    publish: {
        width: 200,
        height: 200,
        'min-width': 200,
        'min-height': 200,
    },

    ready: function () {
        this._initFocusable(this.$.content);
        this._initResizable();

        //
        var tabs = this.$.tabs;
        tabs.panel = this;

        //
        for ( var i = 0; i < this.children.length; ++i ) {
            var el = this.children[i];

            //
            var name = el.getAttribute('name');
            var tabEL = tabs.add(name);
            tabEL.setAttribute('draggable', 'true');

            el.style.display = 'none';
            tabEL.viewEL = el;

            tabEL.setIcon( el.icon ); // TEMP HACK
        }

        tabs.select(0);
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
        var autoWidth = false, autoHeight = false;

        // reset width, height
        this.computedWidth = this.width;
        this.computedHeight = this.height;

        for ( var i = 0; i < this.children.length; ++i ) {
            var el = this.children[i];

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
        var infWidth = false, infHeight = false;

        for ( var i = 0; i < this.children.length; ++i ) {
            var el = this.children[i];

            // NOTE: parseInt('auto') will return NaN, it will return false in if check

            // min-width
            var minWidth = parseInt(el.getAttribute('min-width'));
            if ( minWidth ) {
                if ( this['min-width'] === 'auto' || minWidth > this['min-width'] ) {
                    this.computedMinWidth = minWidth;
                }
            }

            // min-height
            var minHeight = parseInt(el.getAttribute('min-height'));
            if ( minHeight ) {
                if ( this['min-height'] === 'auto' || minHeight > this['min-height'] ) {
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
                if ( this['max-width'] === 'auto' ) {
                    infWidth = true;
                }
                else if ( maxWidth && maxWidth > this['max-width'] ) {
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
                if ( this['max-height'] === 'auto' ) {
                    infHeight = true;
                }
                else if ( maxHeight && maxHeight > this['max-height'] ) {
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

    get tabCount () {
        return this.$.tabs.children.length;
    },

    select: function ( tab ) {
        var tabs = this.$.tabs;
        tabs.select(tab);
    },

    insert: function ( tabEL, viewEL, insertBeforeTabEL ) {
        var tabs = this.$.tabs;

        var name = viewEL.getAttribute('name');
        tabs.insert(tabEL, insertBeforeTabEL);
        tabEL.setAttribute('draggable', 'true');

        // NOTE: if we just move tabs, we must not hide viewEL
        if ( tabEL.parentElement !== tabs ) {
            viewEL.style.display = 'none';
        }
        tabEL.viewEL = viewEL;
        tabEL.setIcon( viewEL.icon ); // TEMP HACK

        //
        this.appendChild(viewEL);

        //
        this._applyViewMinMax();
        this._applyStyle();

        return EditorUI.index(tabEL);
    },

    add: function ( viewEL ) {
        var tabs = this.$.tabs;

        var name = viewEL.getAttribute('name');
        var tabEL = tabs.add(name);
        tabEL.setAttribute('draggable', 'true');

        viewEL.style.display = 'none';
        tabEL.viewEL = viewEL;
        tabEL.setIcon( viewEL.icon ); // TEMP HACK

        this.appendChild(viewEL);

        //
        this._applyViewMinMax();
        this._applyStyle();

        //
        return this.children.length - 1;
    },

    closeNoCollapse: function ( tabEL ) {
        var tabs = this.$.tabs;

        //
        tabs.remove(tabEL);
        if ( tabEL.viewEL ) {
            tabEL.viewEL.remove();
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
        // remove from dock;
        if ( this.$.tabs.children.length === 0 ) {
            if ( this.parentElement instanceof FireDock ) {
                return this.parentElement.removeDock(this);
            }
        }

        return false;
    },

    tabsChangedAction: function ( event ) {
        var detail = event.detail;
        if ( detail.old !== null ) {
            detail.old.viewEL.style.display = 'none';
            detail.old.viewEL.dispatchEvent( new CustomEvent('hide') );
        }
        if ( detail.new !== null ) {
            detail.new.viewEL.style.display = '';
            detail.new.viewEL.dispatchEvent( new CustomEvent('show') );
        }

        event.stopPropagation();
    },
});
