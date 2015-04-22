(function () {

EditorUI.Tab = Polymer({
    is: 'editor-tab',

    name: '',
    viewEL: null,

    listeners: {
        'dragstart': '_onDragStart',
        'click': '_onClick',
        // 'mouseenter': '_onMouseEnter',
        // 'mouseleave': '_onMouseLeave',
    },

    ready: function () {
        this.setIcon(null);
    },

    constructor: function ( name ) {
        this.name = name;
    },

    _onDragStart: function ( event ) {
        event.stopPropagation();

        EditorUI.DockUtils.dragstart( event.dataTransfer, this );
    },

    _onClick: function ( event ) {
        event.stopPropagation();

        var thisDOM = Polymer.dom(this);
        this.fire( 'tab-click', {} );
    },

    // NOTE: there is a bug on css:hover for tab,
    // when we drop tab 'foo' on top of tab 'bar' to insert before it,
    // the tab 'bar' will keep css:hover state after.
    // _onMouseEnter: function ( event ) {
    //     this.classList.add('hover');
    // },

    // _onMouseLeave: function ( event ) {
    //     this.classList.remove('hover');
    // },

    setIcon: function ( img ) {
        var iconDOM = Polymer.dom(this.$.icon);
        if ( img ) {
            this.$.icon.style.display = 'inline';
            if ( iconDOM.children.length > 0 ) {
                iconDOM.removeChild(this.$.icon.firstChild);
            }
            this.$.icon.appendChild(img);
            img.setAttribute('draggable','false'); // this will prevent item dragging
        }
        else {
            this.$.icon.style.display = 'none';
            if ( iconDOM.children.length > 0 ) {
                iconDOM.removeChild(this.$.icon.firstChild);
            }
        }
    },
});

})();