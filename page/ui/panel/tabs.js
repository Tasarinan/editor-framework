(function () {

EditorUI.Tabs = Polymer(EditorUI.mixin({
    is: 'editor-tabs',

    activeTab: null,
    panel: null,

    hostAttributes: {
        'droppable': 'tab',
        'single-drop': true,
    },

    listeners: {
        'tab-click': '_onTabClick',
        'drop-area-enter': '_onDropAreaEnter',
        'drop-area-leave': '_onDropAreaLeave',
        'drop-area-accept': '_onDropAreaAccept',
        'dragover': '_onDragOver',
    },

    ready: function () {
        this._initDroppable(this);

        var thisDOM = Polymer.dom(this);
        if ( thisDOM.children.length > 0 ) {
            this.select(thisDOM.children[0]);
        }
    },

    insert: function ( tabEL, insertBeforeTabEL ) {
        var thisDOM = Polymer.dom(this);

        if ( insertBeforeTabEL ) {
            thisDOM.insertBefore(tabEL, insertBeforeTabEL);
        }
        else {
            thisDOM.appendChild(tabEL);
        }

        return tabEL;
    },

    add: function ( name ) {
        var thisDOM = Polymer.dom(this);

        var tabEL = new EditorUI.Tab(name);

        thisDOM.appendChild(tabEL);

        return tabEL;
    },

    remove: function ( tab ) {
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
                this.fire( 'changed', { old: this.activeTab, new: tabEL  } );

                if ( this.activeTab !== null ) {
                    this.activeTab.classList.remove('active');
                }
                this.activeTab = tabEL;
                this.activeTab.classList.add('active');
                tabEL.fire('active');
            }
        }
    },

    _onTabClick: function ( event ) {
        event.stopPropagation();
        this.select(event.target);
    },

    _onDropAreaEnter: function ( event ) {
        event.stopPropagation();

        this.$.insertLine.style.display = 'block';
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
        var type = event.dataTransfer.getData('fire/type');
        if ( type !== 'tab' )
            return;

        EditorUI.DockUtils.dragoverTab( this );

        //
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';

        //
        this._curInsertTab = null;
        var style = this.$.insertLine.style;
        if ( event.target instanceof EditorUI.Tab ) {
            style.left = event.target.offsetLeft + 'px';
            this._curInsertTab = event.target;
        }
        else {
            var el = this.lastElementChild;
            style.left = (el.offsetLeft + el.offsetWidth) + 'px';
        }
    },
}, EditorUI.droppable));

})();
