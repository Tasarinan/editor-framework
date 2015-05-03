function _makeOutIn ( fnIn, fnOut ) {
    return function ( k ) {
        if (k < 0.5) return fnOut(k*2)/2;
        return fnIn(2*k-1)/2 + 0.5;
    };
}

var Easing = {};

Easing.linear = function (k) { return k; };

// quad
//  Easing equation function for a quadratic (t^2)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.quadIn = function (k) { return k*k; };
Easing.quadOut = function (k) { return k * ( 2 - k ); };
Easing.quadInOut = function (k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
    return - 0.5 * ( --k * ( k - 2 ) - 1 );
};
Easing.quadOutIn = _makeOutIn( Easing.quadIn, Easing.quadOut );

// cubic
//  Easing equation function for a cubic (t^3)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.cubicIn = function (k) { return k * k * k; };
Easing.cubicOut = function (k) { return --k * k * k + 1; };
Easing.cubicInOut = function (k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
};
Easing.cubicOutIn = _makeOutIn( Easing.cubicIn, Easing.cubicOut );

// quart
//  Easing equation function for a quartic (t^4)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.quartIn = function (k) { return k * k * k * k; };
Easing.quartOut = function (k) { return 1 - ( --k * k * k * k ); };
Easing.quartInOut = function (k) {
    if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
    return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
};
Easing.quartOutIn = _makeOutIn( Easing.quartIn, Easing.quartOut );

// quint
//  Easing equation function for a quintic (t^5)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.quintIn = function (k) { return k * k * k * k * k; };
Easing.quintOut = function (k) { return --k * k * k * k * k + 1; };
Easing.quintInOut = function (k) {
    if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
};
Easing.quintOutIn = _makeOutIn( Easing.quintIn, Easing.quintOut );

// sine
//  Easing equation function for a sinusoidal (sin(t))
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.sineIn = function (k) { return 1 - Math.cos( k * Math.PI / 2 ); };
Easing.sineOut = function (k) { return Math.sin( k * Math.PI / 2 ); };
Easing.sineInOut = function (k) { return 0.5 * ( 1 - Math.cos( Math.PI * k ) ); };
Easing.sineOutIn = _makeOutIn( Easing.sineIn, Easing.sineOut );

// expo
//  Easing equation function for an exponential (2^t)
//  param t: Current time (in frames or seconds).
//  return: The correct value.

Easing.expoIn = function (k) { return k === 0 ? 0 : Math.pow( 1024, k - 1 ); };
Easing.expoOut = function (k) { return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k ); };
Easing.expoInOut = function (k) {
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
    return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
};
Easing.expoOutIn = _makeOutIn( Easing.expoIn, Easing.expoOut );

// circ
//  Easing equation function for a circular (sqrt(1-t^2))
//  @param t: Current time (in frames or seconds).
//  @return:	The correct value.

Easing.circIn = function (k) { return 1 - Math.sqrt( 1 - k * k ); };
Easing.circOut = function (k) { return Math.sqrt( 1 - ( --k * k ) ); };
Easing.circInOut = function (k) {
    if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
    return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
};
Easing.circOutIn = _makeOutIn( Easing.circIn, Easing.circOut );

// elastic
//  Easing equation function for an elastic (exponentially decaying sine wave)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.
//  recommand value: elastic (t)

Easing.elasticIn = function (k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
};
Easing.elasticOut = function (k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
};
Easing.elasticInOut = function (k) {
    var s, a = 0.1, p = 0.4;
    if ( k === 0 ) return 0;
    if ( k === 1 ) return 1;
    if ( !a || a < 1 ) { a = 1; s = p / 4; }
    else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
    if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
};
Easing.elasticOutIn = _makeOutIn( Easing.elasticIn, Easing.elasticOut );

// back
//  Easing equation function for a back (overshooting cubic easing: (s+1)*t^3 - s*t^2)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.backIn = function (k) {
    var s = 1.70158;
    return k * k * ( ( s + 1 ) * k - s );
};
Easing.backOut = function (k) {
    var s = 1.70158;
    return --k * k * ( ( s + 1 ) * k + s ) + 1;
};
Easing.backInOut = function (k) {
    var s = 1.70158 * 1.525;
    if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
};
Easing.backOutIn = _makeOutIn( Easing.backIn, Easing.backOut );

// bounce
//  Easing equation function for a bounce (exponentially decaying parabolic bounce)
//  @param t: Current time (in frames or seconds).
//  @return: The correct value.

Easing.bounceIn = function ( k ) { return 1 - Easing.bounceOut( 1 - k ); };
Easing.bounceOut = function ( k ) {
    if ( k < ( 1 / 2.75 ) ) {
        return 7.5625 * k * k;
    } else if ( k < ( 2 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    } else if ( k < ( 2.5 / 2.75 ) ) {
        return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    } else {
        return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
    }
};
Easing.bounceInOut = function ( k ) {
    if ( k < 0.5 ) return Easing.bounceIn( k * 2 ) * 0.5;
    return Easing.bounceOut( k * 2 - 1 ) * 0.5 + 0.5;
};
Easing.bounceOutIn = _makeOutIn( Easing.bounceIn, Easing.bounceOut );

// smooth
// t<=0: 0 | 0<t<1: 3*t^2 - 2*t^3 | t>=1: 1

Easing.smooth = function (t) {
    if ( t <= 0 ) return 0;
    if ( t >= 1 ) return 1;
    return t*t*(3 - 2*t);
};

// fade
// t<=0: 0 | 0<t<1: 6*t^5 - 15*t^4 + 10*t^3 | t>=1: 1

Easing.fade = function (t) {
    if ( t <= 0 ) return 0;
    if ( t >= 1 ) return 1;
    return t*t*t*(t*(t*6-15)+10);
};


module.exports = Easing;
