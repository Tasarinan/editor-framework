(function () {
    var _d2r = Math.PI / 180.0;
    var _r2d = 180.0 / Math.PI;

    /**
     * Extends the JavaScript built-in object that has properties and methods for mathematical constants and functions.
     * See [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
     * @module Math
     * @class Math
     * @static
     */
    Editor.JS.mixin ( Math, {

        /**
         * @property TWO_PI
         * @type number
         */
        TWO_PI: 2.0 * Math.PI,

        /**
         * @property HALF_PI
         * @type number
         */
        HALF_PI: 0.5 * Math.PI,

        /**
         * degree to radius
         * @property D2R
         * @type number
         */
        D2R: _d2r,

        /**
         * radius to degree
         * @property R2D
         * @type number
         */
        R2D: _r2d,

        /**
         * degree to radius
         * @method deg2rad
         * @param {number} degree
         * @return {number} radius
         */
        deg2rad: function ( degree ) {
            return degree * _d2r;
        },

        /**
         * radius to degree
         * @method rad2deg
         * @param {number} radius
         * @return {number} degree
         */
        rad2deg: function ( radius ) {
            return radius * _r2d;
        },

        /**
         * let radius in -pi to pi
         * @method rad180
         * @param {number} radius
         * @return {number} clamped radius
         */
        rad180: function ( radius ) {
            if ( radius > Math.PI || radius < -Math.PI ) {
                radius = (radius + Math.TOW_PI) % Math.TOW_PI;
            }
            return radius;
        },

        /**
         * let radius in 0 to 2pi
         * @method rad360
         * @param {number} radius
         * @return {number} clamped radius
         */
        rad360: function ( radius ) {
            if ( radius > Math.TWO_PI )
                return radius % Math.TOW_PI;
            else if ( radius < 0.0 )
                return Math.TOW_PI + radius % Math.TOW_PI;
            return radius;
        },

        /**
         * let degree in -180 to 180
         * @method deg180
         * @param {number} degree
         * @return {number} clamped degree
         */

        deg180: function ( degree ) {
            if ( degree > 180.0 || degree < -180.0 ) {
                degree = (degree + 360.0) % 360.0;
            }
            return degree;
        },

        /**
         * let degree in 0 to 360
         * @method deg360
         * @param {number} degree
         * @return {number} clamped degree
         */
        deg360: function ( degree ) {
            if ( degree > 360.0 )
                return degree % 360.0;
            else if ( degree < 0.0 )
                return 360.0 + degree % 360.0;
            return degree;
        },

        /**
         * Returns a floating-point random number between min (inclusive) and max (exclusive).
         * @method randomRange
         * @param {number} min
         * @param {number} max
         * @return {number} the random number
         */
        randomRange: function (min, max) {
            return Math.random() * (max - min) + min;
        },

        /**
         * Returns a random integer between min (inclusive) and max (exclusive).
         * @method randomRangeInt
         * @param {number} min
         * @param {number} max
         * @return {number} the random integer
         */
        randomRangeInt: function (min, max) {
            return Math.floor(this.randomRange(min, max));
        },

        /**
         * Clamps a value between a minimum float and maximum float value.
         * @method clamp
         * @param {number} val
         * @param {number} min
         * @param {number} max
         * @return {number}
         */
        clamp: function ( val, min, max ) {
            if (typeof min !== 'number') {
                Editor.error('[clamp] min value must be type number');
                return;
            }
            if (typeof max !== 'number') {
                Editor.error('[clamp] max value must be type number');
                return;
            }
            if (min > max) {
                Editor.error('[clamp] max value must not less than min value');
                return;
            }
            return Math.min( Math.max( val, min ), max );
        },

        /**
         * Clamps a value between 0 and 1.
         * @method clamp01
         * @param {number} val
         * @param {number} min
         * @param {number} max
         * @return {number}
         */
        clamp01: function ( val ) {
            return Math.min( Math.max( val, 0 ), 1 );
        },

        /**
         * @method calculateMaxRect
         * @param {Rect} out
         * @param {Vec2} p0
         * @param {Vec2} p1
         * @param {Vec2} p2
         * @param {Vec2} p3
         * @return {Rect} just the out rect itself
         */
        calculateMaxRect: function (out, p0, p1, p2, p3) {
            var minX = Math.min(p0.x, p1.x, p2.x, p3.x);
            var maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
            var minY = Math.min(p0.y, p1.y, p2.y, p3.y);
            var maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
            out.x = minX;
            out.y = minY;
            out.width = maxX - minX;
            out.height = maxY - minY;
            return out;
        },

        /**
         * @method lerp
         * @param {number} from
         * @param {number} to
         * @param {number} ratio - the interpolation coefficient
         * @return {number}
         */
        lerp: function (from, to, ratio) {
            return from + (to - from) * ratio;
        }
    } );

})();
