function _snapPixel (p) {
    return Math.floor(p);
}

// pixi config
PIXI.utils._saidHello = true;

window['widgets.pixi-grid'] = Polymer({
    is: 'pixi-grid',

    properties: {
        xscale: {
            type: Number,
            value: 1.0,
            observer: '_scaleChanged',
        },

        yscale: {
            type: Number,
            value: 1.0,
            observer: '_scaleChanged',
        },

        debugInfo: {
            type: Object,
            value: {
                xMinLevel: 0,
                xMaxLevel: 0,
                yMinLevel: 0,
                yMaxLevel: 0,
            },
        },
    },

    _computedScale: function ( scale ) {
        return scale.toFixed(3);
    },

    listeners: {
        'mousewheel': '_onMouseWheel',
    },

    created: function () {
        this.canvasWidth = -1;
        this.canvasHeight = -1;
        this.worldPosition = [0, 0];

        this.labels = [];
        this.labelIdx = 0;

        var hscale = new LinearScale();
        hscale
        .initTicks( [5,2], 0.001, 100000 )
        .spacing ( 10, 80 )
        ;
        this.hscale = hscale;

        var vscale = new LinearScale();
        vscale
        .initTicks( [5,2], 0.001, 100000 )
        .spacing ( 10, 80 )
        ;
        this.vscale = vscale;
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

        var scale;
        var changeX = true;
        var changeY = true;

        if ( event.metaKey ) {
            changeX = true;
            changeY = false;
        }
        else if ( event.shiftKey ) {
            changeX = false;
            changeY = true;
        }

        if ( changeX ) {
            scale = this.xscale;
            scale = Math.pow( 2, event.wheelDelta * 0.002) * scale;
            scale = Math.clamp( scale, 0.001, 1000 );
            this.xscale = scale;
        }

        if ( changeY ) {
            scale = this.yscale;
            scale = Math.pow( 2, event.wheelDelta * 0.002) * scale;
            scale = Math.clamp( scale, 0.001, 1000 );
            this.yscale = scale;
        }

        this.repaint();
    },

    autoResize: function () {
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
        return { x: (x * this.xscale + this.canvasWidth/2), y: (-y * this.yscale + this.canvasHeight/2) };
    },

    screenToWorld: function ( x, y ) {
        return { x: (x - this.canvasWidth/2) / this.xscale, y: (this.canvasHeight/2 - y) / this.yscale };
    },

    updateGrids: function () {
        var lineColor = 0x555555;
        var tl = this.screenToWorld( 0.0, 0.0 );
        var br = this.screenToWorld( this.canvasWidth, this.canvasHeight );

        this.hscale.range( tl.x, br.x, this.canvasWidth );
        this.vscale.range( br.y, tl.y, this.canvasHeight );

        this.graphics.clear();
        this.graphics.beginFill(lineColor);

        var i, j, ticks, ratio, trans;

        // draw grids
        for ( i = this.hscale.minTickLevel; i <= this.hscale.maxTickLevel; ++i ) {
            ratio = this.hscale.tickRatios[i];
            if ( ratio > 0 ) {
                this.graphics.lineStyle(1, lineColor, ratio * 0.5);
                ticks = this.hscale.ticksAtLevel(i,true);
                for ( j = 0; j < ticks.length; ++j ) {
                    trans = this.worldToScreen( ticks[j], 0.0 );
                    this.graphics.moveTo( _snapPixel(trans.x), 0.0 );
                    this.graphics.lineTo( _snapPixel(trans.x), this.canvasHeight );
                }
            }
        }

        for ( i = this.vscale.minTickLevel; i <= this.vscale.maxTickLevel; ++i ) {
            ratio = this.vscale.tickRatios[i];
            if ( ratio > 0 ) {
                this.graphics.lineStyle(1, lineColor, ratio * 0.5);
                ticks = this.vscale.ticksAtLevel(i,true);
                for ( j = 0; j < ticks.length; ++j ) {
                    trans = this.worldToScreen( 0.0, ticks[j] );
                    this.graphics.moveTo( 0.0, _snapPixel(trans.y) );
                    this.graphics.lineTo( this.canvasWidth, _snapPixel(trans.y) );
                }
            }
        }

        this.graphics.endFill();

        // draw label
        this.resetLabelPool();
        var labelLevel, labelEL;

        // draw hlabel
        labelLevel = this.hscale.levelForStep(50);
        ticks = this.hscale.ticksAtLevel(labelLevel,false);
        for ( j = 0; j < ticks.length; ++j ) {
            trans = this.worldToScreen( ticks[j], 0.0 );
            labelEL = this.getLabel();
            labelEL.innerText = ticks[j].toFixed(2);
            labelEL.style.left = trans.x + 'px';
            labelEL.style.bottom = '0px';
            labelEL.style.right = '';
            labelEL.style.top = '';
            Polymer.dom(this.$.hlabels).appendChild(labelEL);
        }

        // draw vlabel
        labelLevel = this.vscale.levelForStep(50);
        ticks = this.vscale.ticksAtLevel(labelLevel,false);
        for ( j = 0; j < ticks.length; ++j ) {
            trans = this.worldToScreen( 0.0, ticks[j] );
            labelEL = this.getLabel();
            labelEL.innerText = ticks[j].toFixed(2);
            labelEL.style.left = '0px';
            labelEL.style.top = trans.y + 'px';
            labelEL.style.bottom = '';
            labelEL.style.right = '';
            Polymer.dom(this.$.vlabels).appendChild(labelEL);
        }

        //
        this.clearUnused();

        // DEBUG
        this.setPathValue('debugInfo.xMinLevel', this.hscale.minTickLevel);
        this.setPathValue('debugInfo.xMaxLevel', this.hscale.maxTickLevel);
        this.setPathValue('debugInfo.yMinLevel', this.vscale.minTickLevel);
        this.setPathValue('debugInfo.yMaxLevel', this.vscale.maxTickLevel);
    },

    resetLabelPool: function () {
        this.labelIdx = 0;
    },

    getLabel: function () {
        var el;
        if ( this.labelIdx < this.labels.length ) {
            el = this.labels[this.labelIdx];
            this.labelIdx += 1;
            return el;
        }

        el = document.createElement('div');
        el.classList.add('label');
        this.labels.push(el);
        this.labelIdx += 1;
        return el;
    },

    clearUnused: function () {
        for ( var i = this.labelIdx; i < this.labels.length; ++i ) {
            var el = this.labels[i];
            Polymer.dom(Polymer.dom(el).parentNode).removeChild(el);
        }
        this.labels = this.labels.slice(0,this.labelIdx);
    },
});
