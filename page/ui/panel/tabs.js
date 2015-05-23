(function () {

EditorUI.Tabs = Polymer({
    is: 'editor-tabs',

    behaviors: [ EditorUI.droppable ],

    hostAttributes: {
        'droppable': 'tab',
        'single-drop': true,
    },

    listeners: {
        'click': '_onClick',
        'tab-click': '_onTabClick',
        'drop-area-enter': '_onDropAreaEnter',
        'drop-area-leave': '_onDropAreaLeave',
        'drop-area-accept': '_onDropAreaAccept',
        'dragover': '_onDragOver',
    },

    ready: function () {
        this.activeTab = null;
        this._initDroppable(this);

        var thisDOM = Polymer.dom(this);
        if ( thisDOM.children.length > 0 ) {
            this.select(thisDOM.children[0]);
        }
    },

    findTab: function ( frameEL ) {
        var thisDOM = Polymer.dom(this);

        for ( var i = 0; i < thisDOM.children.length; ++i ) {
            var tabEL = thisDOM.children[i];
            if ( tabEL.frameEL === frameEL )
                return tabEL;
        }

        return null;
    },

    insertTab: function ( tabEL, insertBeforeTabEL ) {
        // do nothing if we insert to ourself
        if ( tabEL === insertBeforeTabEL )
            return tabEL;

        var thisDOM = Polymer.dom(this);

        if ( insertBeforeTabEL ) {
            thisDOM.insertBefore(tabEL, insertBeforeTabEL);
        }
        else {
            thisDOM.appendChild(tabEL);
        }

        return tabEL;
    },

    addTab: function ( name ) {
        var thisDOM = Polymer.dom(this);

        var tabEL = new EditorUI.Tab(name);

        thisDOM.appendChild(tabEL);

        return tabEL;
    },

    removeTab: function ( tab ) {
        var thisDOM = Polymer.dom(this);

        var tabEL = null;
        if ( typeof tab === 'number' ) {
            if ( tab < thisDOM.children.length ) {
                tabEL = thisDOM.children[tab];
            }
        }
        else if ( tab instanceof EditorUI.Tab ) {
            tabEL = tab;
        }

        //
        if ( tabEL !== null ) {
            if ( this.activeTab === tabEL ) {
                this.activeTab = null;

                var nextTab = tabEL.nextElementSibling;
                if ( !nextTab ) {
                    nextTab = tabEL.previousElementSibling;
                }

                this.select(nextTab);
            }

            thisDOM.removeChild(tabEL);
        }
    },

    select: function ( tab ) {
        var thisDOM = Polymer.dom(this);
        var tabEL = null;

        if ( typeof tab === 'number' ) {
            if ( tab < thisDOM.children.length ) {
                tabEL = thisDOM.children[tab];
            }
        }
        else if ( tab instanceof EditorUI.Tab ) {
            tabEL = tab;
        }

        //
        if ( tabEL !== null ) {
            if ( tabEL !== this.activeTab ) {
                var oldTabEL = this.activeTab;

                if ( this.activeTab !== null ) {
                    this.activeTab.classList.remove('active');
                }
                this.activeTab = tabEL;
                this.activeTab.classList.add('active');

                var panelID = tabEL.frameEL.getAttribute('id');
                var pagePanelInfo = Editor.Panel.getPanelInfo(panelID);
                if ( pagePanelInfo ) {
                    this.$.popup.classList.toggle('hide', !pagePanelInfo.popable);
                }

                this.fire( 'tab-changed', { old: oldTabEL, new: tabEL  } );
            }
        }
    },

    outOfDate: function ( tab ) {
        var thisDOM = Polymer.dom(this);
        var tabEL = null;

        if ( typeof tab === 'number' ) {
            if ( tab < thisDOM.children.length ) {
                tabEL = thisDOM.children[tab];
            }
        }
        else if ( tab instanceof EditorUI.Tab ) {
            tabEL = tab;
        }

        //
        if ( tabEL !== null ) {
            tabEL.outOfDate = true;
        }
    },

    _onClick: function ( event ) {
        event.stopPropagation();
        this.panelEL.setFocus();
    },

    _onTabClick: function ( event ) {
        event.stopPropagation();
        this.select(event.target);
        this.panelEL.setFocus();
    },

    _onDropAreaEnter: function ( event ) {
        event.stopPropagation();
    },

    _onDropAreaLeave: function ( event ) {
        event.stopPropagation();

        this.$.insertLine.style.display = '';
    },

    _onDropAreaAccept: function ( event ) {
        event.stopPropagation();

        EditorUI.DockUtils.dropTab(this, this._curInsertTab);
        this.$.insertLine.style.display = '';
    },

    _onDragOver: function ( event ) {
        // NOTE: in web, there is a problem:
        // http://stackoverflow.com/questions/11974077/datatransfer-setdata-of-dragdrop-doesnt-work-in-chrome
        var type = event.dataTransfer.getData('editor/type');
        if ( type !== 'tab' )
            return;

        EditorUI.DockUtils.dragoverTab( this );

        //
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';

        var eventTarget = Polymer.dom(event).localTarget;

        //
        this._curInsertTab = null;
        var style = this.$.insertLine.style;
        style.display = 'block';
        if ( eventTarget instanceof EditorUI.Tab ) {
            style.left = eventTarget.offsetLeft + 'px';
            this._curInsertTab = eventTarget;
        }
        else {
            var tabList = this.$['tab-list'];
            var el = tabList.lastElementChild;
            style.left = (el.offsetLeft + el.offsetWidth) + 'px';
        }
    },

    _onPopup: function ( event ) {
        if ( this.activeTab ) {
            var panelID = this.activeTab.frameEL.getAttribute('id','');
            Editor.Panel.popup(panelID);
        }
    },

    _onMenuPopup: function ( event ) {
        var rect = this.$.menu.getBoundingClientRect();
        var panelID = '';
        if ( this.activeTab ) {
            panelID = this.activeTab.frameEL.getAttribute('id','');
        }

        var panelInfo = Editor.Panel.getPanelInfo(panelID);
        var popable = true;
        if ( panelInfo ) {
            popable = panelInfo.popable;
        }

        Editor.Menu.popup( rect.left + 5, rect.bottom + 5, [
            { label: 'Maximize', message: 'panel:maximize', params: [panelID] },
            { label: 'Pop Out', message: 'panel:popup', enabled: popable, params: [panelID] },
            { label: 'Close', command: 'Editor.Panel.close', params: [panelID] },
            { label: 'Add Tab', submenu: [
                { label: 'TODO' },
            ] },
        ]);
    },
});

})();
