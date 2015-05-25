/**
 * @namespace Editor.Utils
 */
var Utils = {};

/**
 * @memberof Editor.Utils
 * @method padLeft
 * @param {string} text
 * @param {number} width
 * @param {string} ch - the character used to pad
 * @return {string}
 */
Utils.padLeft = function ( text, width, ch ) {
    text = text.toString();
    width -= text.length;
    if ( width > 0 ) {
        return new Array( width + 1 ).join(ch) + text;
    }
    return text;
};

/**
 * @memberof Editor.Utils
 * @method formatFrame
 * @param {number} frame
 * @param {number} frameRate
 * @return {string}
 */
Utils.formatFrame = function ( frame, frameRate ) {
    var decimals = Math.floor(Math.log10(frameRate))+1;
    var text = '';
    if ( frame < 0 ) {
        text = '-';
        frame = -frame;
    }
    return text +
        Math.floor(frame/frameRate) + ':' +
        Utils.padLeft(frame % frameRate, decimals, '0');
};

/**
 * @memberof Editor.Utils
 * @method smoothScale
 * @param {number} curScale
 * @param {number} delta
 * @return {number}
 */
Utils.smoothScale = function ( curScale, delta ) {
    var scale = curScale;
    scale = Math.pow( 2, delta * 0.002) * scale;
    return scale;
};

module.exports = Utils;
