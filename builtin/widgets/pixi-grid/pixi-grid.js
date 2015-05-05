function _snapPixel (p) {
    return Math.floor(p);
}

// pixi config
PIXI.utils._saidHello = true;

window['widgets.pixi-grid'] = Polymer({
    is: 'pixi-grid',

    properties: {
        debugInfo: {
            type: Object,
            value: {
                xAxisScale: 0,
                xMinLevel: 0,
                xMaxLevel: 0,
                yAxisScale: 0,
                yMinLevel: 0,
                yMaxLevel: 0,
            },
        },

        showDebugInfo: {
            type: Boolean,
            value: true,
        },

        showLabel: {
            type: Boolean,
            value: true,
        },
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

        this.hticks = null;
        this.xAxisScale = 1.0;

        this.vticks = null;
        this.yAxisScale = 1.0;
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

    // recommended: [5,2], 0.001, 1000
    setScaleH ( lods, rangeMin, rangeMax ) {
        this.hticks = new LinearTicks()
        .initTicks( lods, rangeMin, rangeMax )
        .spacing ( 10, 80 )
        ;
    },

    setScaleV ( lods, rangeMin, rangeMax ) {
        this.vticks = new LinearTicks()
        .initTicks( lods, rangeMin, rangeMax )
        .spacing ( 10, 80 )
        ;
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

        if ( changeX && this.hticks ) {
            scale = this.xAxisScale;
            scale = Math.pow( 2, event.wheelDelta * 0.002) * scale;
            scale = Math.clamp( scale, this.hticks.minValueScale, this.hticks.maxValueScale );
            this.xAxisScale = scale;

            // TODO
            // var curScale = this.xAxisScale;
            // var nextScale = scale;
            // var start = window.performance.now();
            // var duration = 300;
            // function animateScale ( time ) {
            //     var requestId = requestAnimationFrame ( animateScale.bind(this) );
            //     var cur = time - start;
            //     var ratio = cur/duration;
            //     if ( ratio >= 1.0 ) {
            //         this.xAxisScale = nextScale;
            //         cancelAnimationFrame(requestId);
            //     }
            //     else {
            //         this.xAxisScale = Math.lerp( curScale, nextScale, ratio );
            //     }
            //     this.repaint();
            // };
            // animateScale.call(this,start);
        }

        if ( changeY && this.vticks ) {
            scale = this.yAxisScale;
            scale = Math.pow( 2, event.wheelDelta * 0.002) * scale;
            scale = Math.clamp( scale, this.vticks.minValueScale, this.vticks.maxValueScale );
            this.yAxisScale = scale;
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
        this._updateGrids();
        requestAnimationFrame( function () {
            this.renderer.render(this.stage);
        }.bind(this));
    },

    worldToScreen: function ( x, y ) {
        return { x: (x * this.xAxisScale + this.canvasWidth/2), y: (-y * this.yAxisScale + this.canvasHeight/2) };
    },

    screenToWorld: function ( x, y ) {
        return { x: (x - this.canvasWidth/2) / this.xAxisScale, y: (this.canvasHeight/2 - y) / this.yAxisScale };
    },

    _updateGrids: function () {
        var lineColor = 0x555555;
        var tl = this.screenToWorld( 0.0, 0.0 );
        var br = this.screenToWorld( this.canvasWidth, this.canvasHeight );
        var i, j, ticks, ratio, trans;

        this.graphics.clear();
        this.graphics.beginFill(lineColor);

        // draw h ticks
        if ( this.hticks ) {
            this.hticks.range( tl.x, br.x, this.canvasWidth );
            for ( i = this.hticks.minTickLevel; i <= this.hticks.maxTickLevel; ++i ) {
                ratio = this.hticks.tickRatios[i];
                if ( ratio > 0 ) {
                    this.graphics.lineStyle(1, lineColor, ratio * 0.5);
                    ticks = this.hticks.ticksAtLevel(i,true);
                    for ( j = 0; j < ticks.length; ++j ) {
                        trans = this.worldToScreen( ticks[j], 0.0 );
                        this.graphics.moveTo( _snapPixel(trans.x), 0.0 );
                        this.graphics.lineTo( _snapPixel(trans.x), this.canvasHeight );
                    }
                }
            }
        }

        // draw v ticks
        if ( this.vticks ) {
            this.vticks.range( br.y, tl.y, this.canvasHeight );
            for ( i = this.vticks.minTickLevel; i <= this.vticks.maxTickLevel; ++i ) {
                ratio = this.vticks.tickRatios[i];
                if ( ratio > 0 ) {
                    this.graphics.lineStyle(1, lineColor, ratio * 0.5);
                    ticks = this.vticks.ticksAtLevel(i,true);
                    for ( j = 0; j < ticks.length; ++j ) {
                        trans = this.worldToScreen( 0.0, ticks[j] );
                        this.graphics.moveTo( 0.0, _snapPixel(trans.y) );
                        this.graphics.lineTo( this.canvasWidth, _snapPixel(trans.y) );
                    }
                }
            }
        }

        this.graphics.endFill();

        // draw label
        if ( this.showLabel ) {
            var minStep = 50, labelLevel, labelEL;

            this._resetLabelPool();

            // draw hlabel
            if ( this.hticks ) {
                labelLevel = this.hticks.levelForStep(minStep);
                ticks = this.hticks.ticksAtLevel(labelLevel,false);
                for ( j = 0; j < ticks.length; ++j ) {
                    trans = this.worldToScreen( ticks[j], 0.0 );
                    labelEL = this._requestLabel();
                    labelEL.innerText = numeral(ticks[j]).format('0,0.00');
                    labelEL.style.left = trans.x + 'px';
                    labelEL.style.bottom = '0px';
                    labelEL.style.right = '';
                    labelEL.style.top = '';
                    Polymer.dom(this.$.hlabels).appendChild(labelEL);
                }
            }

            // draw vlabel
            if ( this.vticks ) {
                labelLevel = this.vticks.levelForStep(minStep);
                ticks = this.vticks.ticksAtLevel(labelLevel,false);
                for ( j = 0; j < ticks.length; ++j ) {
                    trans = this.worldToScreen( 0.0, ticks[j] );
                    labelEL = this._requestLabel();
                    labelEL.innerText = numeral(ticks[j]).format('0,0.00');
                    labelEL.style.left = '0px';
                    labelEL.style.top = trans.y + 'px';
                    labelEL.style.bottom = '';
                    labelEL.style.right = '';
                    Polymer.dom(this.$.vlabels).appendChild(labelEL);
                }
            }

            //
            this._clearUnusedLabels();
        }

        // DEBUG
        if ( this.showDebugInfo ) {
            this.setPathValue('debugInfo.xAxisScale', this.xAxisScale.toFixed(3));
            if ( this.hticks ) {
                this.setPathValue('debugInfo.xMinLevel', this.hticks.minTickLevel);
                this.setPathValue('debugInfo.xMaxLevel', this.hticks.maxTickLevel);
            }
            this.setPathValue('debugInfo.yAxisScale', this.yAxisScale.toFixed(3));
            if ( this.vticks ) {
                this.setPathValue('debugInfo.yMinLevel', this.vticks.minTickLevel);
                this.setPathValue('debugInfo.yMaxLevel', this.vticks.maxTickLevel);
            }
        }
    },

    _resetLabelPool: function () {
        this.labelIdx = 0;
    },

    _requestLabel: function () {
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

    _clearUnusedLabels: function () {
        for ( var i = this.labelIdx; i < this.labels.length; ++i ) {
            var el = this.labels[i];
            Polymer.dom(Polymer.dom(el).parentNode).removeChild(el);
        }
        this.labels = this.labels.slice(0,this.labelIdx);
    },
});
