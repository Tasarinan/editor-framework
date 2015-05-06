function LinearTicks () {
    this.ticks = [];
    this.tickLods = [];
    this.tickRatios = [];

    this.minScale = 0.1;
    this.maxScale = 1000.0;

    this.minValueScale = 1.0;
    this.maxValueScale = 1.0;

    this.minValue = -500;
    this.maxValue = 500;

    this.pixelRange = 500;

    this.minSpacing = 10;
    this.maxSpacing = 80;
}

LinearTicks.prototype.initTicks = function ( lods, min, max ) {
    if ( min <= 0 )
        min = 1;
    if ( max <= 0 )
        max = 1;
    if ( max < min )
        max = min;

    this.tickLods = lods;
    this.minScale = min;
    this.maxScale = max;

    // generate ticks
    this.ticks = [];

    var curTick = 1.0;
    var curIdx = 0;

    this.ticks.push(curTick);

    var minScale = min;
    var maxScale = max;
    var maxTickValue = 1;
    var minTickValue = 1;

    while ( curTick * this.tickLods[curIdx] <= maxScale ) {
        curTick = curTick *  this.tickLods[curIdx];
        curIdx = curIdx + 1 > this.tickLods.length-1 ? 0 : curIdx + 1;
        this.ticks.push(curTick);

        maxTickValue = curTick;
    }

    // NOTE: we need to leave two more level for both zoom-in, so enlarge 100 times here.
    this.minValueScale = 1.0/maxTickValue * 100;

    curIdx = this.tickLods.length-1;
    curTick = 1.0;
    while ( curTick / this.tickLods[curIdx] >= minScale ) {
        curTick = curTick / this.tickLods[curIdx];
        curIdx = curIdx - 1 < 0 ? this.tickLods.length-1 : curIdx - 1;
        this.ticks.unshift(curTick);

        minTickValue = curTick;
    }

    // NOTE: we need to leave two more level for both zoom-out, so enlarge 100 times here.
    this.maxValueScale = 1.0/minTickValue * 100;

    return this;
};

LinearTicks.prototype.spacing = function ( min, max ) {
    this.minSpacing = min;
    this.maxSpacing = max;

    return this;
};

LinearTicks.prototype.range = function ( minValue, maxValue, pixelRange ) {
    // NOTE: Math.fround here to prevent label blinking
    this.minValue = Math.fround(Math.min(minValue,maxValue));
    this.maxValue = Math.fround(Math.max(minValue,maxValue));

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

LinearTicks.prototype.ticksAtLevel = function ( level, excludeHigherLevel ) {
    var results = [];
    var tick = this.ticks[level];
    // NOTE: we use `Math.floor` and `<= end` for one more line
    //       so that label draw will not cut off when at the edge of the viewport
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

LinearTicks.prototype.levelForStep = function ( step ) {
    for ( var i = 0; i < this.ticks.length; ++i ) {
        var ratio = this.ticks[i] * this.pixelRange / (this.maxValue - this.minValue);
        if ( ratio >= step ) {
            return i;
        }
    }
    return -1;
};
