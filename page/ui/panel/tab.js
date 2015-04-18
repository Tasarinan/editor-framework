(function () {

EditorUI.Tab = Polymer({
    is: 'editor-tab',

    name: '',
    viewEL: null,

    listeners: {
        'dragstart': '_onDragStart',
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
