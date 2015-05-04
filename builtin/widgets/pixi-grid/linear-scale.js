function LinearScale () {
    this.ticks = [];
    this.tickLods = [];
    this.tickRatios = [];

    this.minScale = 0.1;
    this.maxScale = 1000.0;

    this.minValue = -500;
    this.maxValue = 500;

    this.pixelRange = 500;

    this.minSpacing = 10;
    this.maxSpacing = 80;
}

LinearScale.prototype.initTicks = function ( lods, min, max ) {
    this.tickLods = lods;
    this.minScale = min;
    this.maxScale = max;

    // generate ticks
    this.ticks = [];

    var curScale = 1.0;
    var curIdx = 0;

    this.ticks.push(curScale);

    while ( curScale * this.tickLods[curIdx] <= this.maxScale ) {
        curScale = curScale *  this.tickLods[curIdx];
        curIdx = curIdx + 1 > this.tickLods.length-1 ? 0 : curIdx + 1;
        this.ticks.push(curScale);
    }

    curIdx = this.tickLods.length-1;
    curScale = 1.0;
    while ( curScale / this.tickLods[curIdx] >= this.minScale ) {
        curScale = curScale / this.tickLods[curIdx];
        curIdx = curIdx - 1 < 0 ? this.tickLods.length-1 : curIdx - 1;
        this.ticks.unshift(curScale);
    }

    return this;
};

LinearScale.prototype.range = function ( minValue, maxValue, pixelRange ) {
    this.minValue = minValue;
    this.maxValue = maxValue;

    this.pixelRange = pixelRange;

    this.minTickLevel = 0;
    this.maxTickLevel = this.ticks.length-1;

    for ( var i = this.ticks.length-1; i >= 0; --i ) {
        var ratio = this.ticks[i] * this.pixelRange / (this.maxValue - this.minValue);
        this.tickRatios[i] = (ratio - this.minSpacing) / (this.maxSpacing - this.minSpacing);
        if ( this.tickRatios[i] >= 1.0 ) {
            this.maxTickLevel = i;
        }
        if ( ratio <= this.minSpacing ) {
            this.minTickLevel = i;
            break;
        }
    }

    for ( var j = this.minTickLevel; j <= this.maxTickLevel; ++j ) {
        this.tickRatios[j] = Math.clamp01(this.tickRatios[j]);
    }

    return this;
};

LinearScale.prototype.spacing = function ( min, max ) {
    this.minSpacing = min;
    this.maxSpacing = max;

    return this;
};

LinearScale.prototype.ticksAtLevel = function ( level, excludeHigherLevel ) {
    var results = [];
    var tick = this.ticks[level];
    var start = Math.floor( this.minValue / tick );
    var end = Math.ceil( this.maxValue / tick );
    for ( var i = start; i <= end; ++i ) {
        if ( !excludeHigherLevel ||
             level >= this.maxTickLevel ||
             i % Math.round(this.ticks[level+1] / tick) !== 0 )
        {
            results.push( i * tick );
        }
    }

    return results;
};

LinearScale.prototype.levelForStep = function ( step ) {
    for ( var i = 0; i < this.ticks.length; ++i ) {
        var ratio = this.ticks[i] * this.pixelRange / (this.maxValue - this.minValue);
        if ( ratio >= step ) {
            return i;
        }
    }
    return -1;
};
