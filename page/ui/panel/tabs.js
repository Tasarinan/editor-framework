(function () {

EditorUI.Tabs = Polymer(EditorUI.mixin({
    is: 'editor-tabs',

    hostAttributes: {
        'droppable': 'tab',
        'single-drop': true,
    },

    created: function () {
        this.activeTab = null;
    },

    ready: function () {
        this._initDroppable(this);

        if ( this.children.length > 0 ) {
            this.select(this.children[0]);
        }
    },

    clickAction: function ( event ) {
        this.select(event.target);
        event.stopPropagation();
    },

    insert: function ( tabEL, insertBeforeTabEL ) {
        if ( insertBeforeTabEL ) {
            this.insertBefore(tabEL, insertBeforeTabEL);
        }
        else {
            this.appendChild(tabEL);
        }

        return tabEL;
    },

    add: function ( name ) {
        var tabEL = new FireTab();
        tabEL.innerHTML = name;

        this.appendChild(tabEL);

        return tabEL;
    },

    remove: function ( tab ) {
        var tabEL = null;
        if ( typeof tab === 'number' ) {
            if ( tab < this.children.length ) {
                tabEL = this.children[tab];
            }
        }
        else if ( tab instanceof FireTab ) {
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

            this.removeChild(tabEL);
        }
    },

    select: function ( tab ) {
        var tabEL = null;

        if ( typeof tab === 'number' ) {
            if ( tab < this.children.length ) {
                tabEL = this.children[tab];
            }
        }
        else if ( tab instanceof FireTab ) {
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

    dropAreaEnterAction: function ( event ) {
        event.stopPropagation();

        this.$.insertLine.style.display = 'block';
    },

    dropAreaLeaveAction: function ( event ) {
        event.stopPropagation();

        this.$.insertLine.style.display = '';
    },

    dropAreaAcceptAction: function ( event ) {
        event.stopPropagation();

        EditorUI.DockUtils.dropTab(this, this._curInsertTab);
        this.$.insertLine.style.display = '';
    },

    dragoverAction: function ( event ) {
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
        if ( event.target instanceof FireTab ) {
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
