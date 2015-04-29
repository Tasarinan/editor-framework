function _snapPixel (p) {
    return Math.floor(p);
}

function _smooth (t) {
    return ( t === 1.0 ) ? 1.0 : 1.001 * ( 1.0 - Math.pow( 2, -10 * t ) );
}

window.grids = {};
grids.pixi = Polymer( {
    is: 'pixi-grids',

    canvasWidth: -1,
    canvasHeight: -1,
    worldPosition: [0, 0],

    properties: {
        scale: {
            type: Number,
            value: 1.0,
            observer: '_scaleChanged',
        }
    },

    listeners: {
        'mousewheel': '_onMouseWheel',
        'resize': '_onResize',
        'panel-active': '_onPanelActive',
    },

    ready: function () {
        var rect = this.$.view.getBoundingClientRect();
        this.renderer = new PIXI.WebGLRenderer( rect.width, rect.height, {
            view: this.$.canvas,
            transparent: true,
        });

        this.stage = new PIXI.Container();
        var background = new PIXI.Container();
        this.stage.addChild(background);

        this.graphics = new PIXI.Graphics();
        background.addChild(this.graphics);
    },

    _scaleChanged: function () {
        if ( !this.renderer )
            return;

        this.repaint();
    },

    _onMouseWheel: function ( event ) {
        event.stopPropagation();

        var scale = this.scale;
        scale = Math.pow( 2, event.wheelDelta * 0.002) * scale;
        scale = Math.max( 0.01, Math.min( scale, 1000 ) );
        this.scale = scale;

        this.repaint();
    },

    _onResize: function ( event ) {
        var rect = this.$.view.getBoundingClientRect();
        this.resize(rect.width, rect.height);
    },

    _onPanelActive: function ( event ) {
        var rect = this.$.view.getBoundingClientRect();
        this.resize(rect.width, rect.height);
    },

    resize: function ( w, h ) {
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.renderer.resize( this.canvasWidth, this.canvasHeight );

        this.repaint();
    },

    repaint: function () {
        this.updateGrids();
        requestAnimationFrame( function () {
            this.renderer.render(this.stage);
        }.bind(this));
    },

    worldToScreen: function ( x, y ) {
        return { x: (x * this.scale + this.canvasWidth/2), y: (-y * this.scale + this.canvasHeight/2) };
    },

    screenToWorld: function ( x, y ) {
        return { x: (x - this.canvasWidth/2) / this.scale, y: (this.canvasHeight/2 - y) / this.scale };
    },

    updateGrids: function () {
        var i = 0;

        var tickUnit = 100;
        var tickCount = 10;
        var tickDistance = 50;

        var nextTickCount = 1;
        var curTickUnit = tickUnit;
        var ratio = 1.0;
        var trans;

        if ( this.scale >= 1.0 ) {
            while ( tickDistance*nextTickCount < tickUnit*this.scale ) {
                nextTickCount = nextTickCount * tickCount;
            }
            curTickUnit = tickUnit/nextTickCount * tickCount;
            ratio = (tickUnit*this.scale) / (tickDistance*nextTickCount);
        }
        else if ( this.scale < 1.0 ) {
            while ( tickDistance/nextTickCount > tickUnit*this.scale ) {
                nextTickCount = nextTickCount * tickCount;
            }
            curTickUnit = tickUnit*nextTickCount;
            ratio = (tickUnit*this.scale) / (tickDistance/nextTickCount);
            ratio /= 10.0;
        }
        ratio = (ratio - 1.0/tickCount) / (1.0 - 1.0/tickCount);

        var start = this.screenToWorld ( 0, 0 );
        var end = this.screenToWorld ( this.canvasWidth, this.canvasHeight );

        var start_x = Math.ceil(start.x/curTickUnit) * curTickUnit;
        var end_x = end.x;
        var start_y = Math.ceil(end.y/curTickUnit) * curTickUnit;
        var end_y = start.y;

        this.graphics.clear();
        this.graphics.beginFill(0x555555);

        // draw x lines
        var tickIndex = Math.round(start_x/curTickUnit);
        for ( var x = start_x; x < end_x; x += curTickUnit ) {
            if ( tickIndex % tickCount === 0 ) {
                this.graphics.lineStyle(1, 0x555555, 1.0);
            }
            else {
                this.graphics.lineStyle(1, 0x555555, _smooth(ratio));
            }
            ++tickIndex;

            trans = this.worldToScreen( x, 0.0 );
            this.graphics.moveTo( _snapPixel(trans.x), -1.0 );
            this.graphics.lineTo( _snapPixel(trans.x), this.canvasHeight );
        }

        // draw y lines
        tickIndex = Math.round(start_y/curTickUnit);
        for ( var y = start_y; y < end_y; y += curTickUnit ) {
            if ( tickIndex % tickCount === 0 ) {
                this.graphics.lineStyle(1, 0x555555, 1.0);
            }
            else {
                this.graphics.lineStyle(1, 0x555555, _smooth(ratio));
            }
            ++tickIndex;

            trans = this.worldToScreen( 0.0, y );
            this.graphics.moveTo( 0.0, _snapPixel(trans.y) );
            this.graphics.lineTo( this.canvasWidth, _snapPixel(trans.y) );
        }
        this.graphics.endFill();
    },
});
