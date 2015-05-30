// pixi-grid config
Editor.registerPanel( 'demo-grid.panel', {
    is: 'demo-grid',

    listeners: {
        'resize': '_onResize',
        'panel-show': '_onPanelShow',
        'keydown': '_onKeyDown',
        'keyup': '_onKeyUp',
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
            if ( event.shiftKey ) {
                this.style.cursor = '-webkit-grabbing';
                EditorUI.startDrag('-webkit-grabbing', event,
                                   // move
                                   function ( event, dx, dy, offsetx, offsety ) {
                                       this.$.grid.pan( dx, dy );
                                       this.$.grid.repaint();
                                   }.bind(this),

                                   // end
                                   function ( event, dx, dy, offsetx, offsety ) {
                                       if ( event.shiftKey )
                                           this.style.cursor = '-webkit-grab';
                                       else
                                           this.style.cursor = '';
                                   }.bind(this));
                return;
            }
            else {
                var rect = this.$.grid.getBoundingClientRect();
                var startx = event.clientX - rect.left;
                var starty = event.clientY - rect.top;

                EditorUI.startDrag('default', event,
                                   // move
                                   function ( event, dx, dy, offsetx, offsety ) {
                                       var x = startx;
                                       var y = starty;
                                       if ( offsetx < 0.0 ) {
                                           x += offsetx;
                                           offsetx = -offsetx;
                                       }
                                       if ( offsety < 0.0 ) {
                                           y += offsety;
                                           offsety = -offsety;
                                       }

                                       // this.$.grid.updateSelectRect( x, y, offsetx, offsety );
                                       // this.$.grid.repaint();
                                   }.bind(this),

                                   // end
                                   function ( event, dx, dy, offsetx, offsety ) {
                                       // this.$.grid.clearSelectRect();
                                       // this.$.grid.repaint();
                                   }.bind(this));
                return;
            }
        }
    },

    _onKeyDown: function ( event ) {
        event.stopPropagation();

        if ( Editor.KeyCode(event.which) === 'shift' ) {
            this.style.cursor = '-webkit-grab';
        }
    },

    _onKeyUp: function ( event ) {
        event.stopPropagation();

        if ( Editor.KeyCode(event.which) === 'shift' ) {
            this.style.cursor = '';
        }
    },
});
