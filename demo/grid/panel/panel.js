// pixi-grid config
Editor.registerPanel( 'grid-demo.panel', {
    is: 'grid-demo',

    listeners: {
        'resize': '_onResize',
        'panel-show': '_onPanelShow',
    },

    ready: function () {
        // grid
        this.$.grid.setScaleH( [5,2,3,2], 1, 1000, 'frame' );
        // this.$.grid.setScaleH( [5,2], 0.01, 1000 );
        this.$.grid.setMappingH( 0, 100, 100 );

        this.$.grid.setScaleV( [5,2], 0.01, 1000 );
        this.$.grid.setMappingV( 100, -100, 200 );

        this.$.grid.setAnchor( 0.0, 0.5 );
    },

    _onResize: function ( event ) {
        this.$.grid.resize();
        this.$.grid.repaint();
    },

    _onPanelShow: function ( event ) {
        this.$.grid.resize();
        this.$.grid.repaint();
    },

    _onMouseWheel: function ( event ) {
        this.$.grid.scaleAction ( event );
    },

    _onMouseDown: function ( event ) {
        if ( event.which === 1 ) {
            event.stopPropagation();

            var mousemoveHandle = function(event) {
                event.stopPropagation();

                var dx = event.clientX - this._lastClientX;
                var dy = event.clientY - this._lastClientY;

                this._lastClientX = event.clientX;
                this._lastClientY = event.clientY;

                this.$.grid.pan( dx, dy );
                this.$.grid.repaint();
            }.bind(this);

            var mouseupHandle = function(event) {
                event.stopPropagation();

                document.removeEventListener('mousemove', mousemoveHandle);
                document.removeEventListener('mouseup', mouseupHandle);

                EditorUI.removeDragGhost();
                this.style.cursor = '';
            }.bind(this);

            //
            this._lastClientX = event.clientX;
            this._lastClientY = event.clientY;

            //
            EditorUI.addDragGhost('-webkit-grabbing');
            this.style.cursor = '-webkit-grabbing';
            document.addEventListener ( 'mousemove', mousemoveHandle );
            document.addEventListener ( 'mouseup', mouseupHandle );

            return;
        }
    },
});
