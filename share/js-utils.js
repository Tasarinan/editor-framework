function _getPropertyDescriptor(obj, name) {
    if (obj) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        return pd || _getPropertyDescriptor(Object.getPrototypeOf(obj), name);
    }
}

function _copyprop(name, source, target) {
    var pd = _getPropertyDescriptor(source, name);
    Object.defineProperty(target, name, pd);
}

/**
 * @namespace Editor.JS
 */
module.exports = {
    /**
     * Copy property by name from source to target
     * @method copyprop
     * @memberof Editor.JS
     * @param {string} name
     * @param {object} source
     * @param {object} target
     */
    copyprop: _copyprop,

    /**
     * copy all properties not defined in obj from arguments[1...n]
     * @method addon
     * @memberof Editor.JS
     * @param {object} obj - object to extend its properties
     * @param {...object} sourceObj - source object to copy properties from
     * @return {object} the result obj
     */
    addon: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            for ( var name in source) {
                if ( !(name in obj) ) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * Extract properties by `propNames` from `obj`
     * @method extract
     * @memberof Editor.JS
     * @param {object} obj - object to extend its properties
     * @param {string[]} propNames
     * @return {object} - the result obj
     */
    extract: function ( obj, propNames ) {
        'use strict';
        var newObj = {};
        for ( var i = 0; i < propNames.length; ++i ) {
            var name = propNames[i];
            if ( obj[name] !== undefined ) {
                _copyprop( name, obj, newObj);
            }
        }
        return newObj;
    },

    /**
     * Copy all properties from arguments[1...n] to obj
     * @method mixin
     * @memberof Editor.JS
     * @param {object} obj
     * @param {...object} sourceObj
     * @return {object} the result obj
     */
    mixin: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    Editor.error('JS.mixin called on non-object:', source);
                    continue;
                }
                for ( var name in source) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * Derive the class from the supplied base class.
     * @method extend
     * @memberof Editor.JS
     * @param {function} cls
     * @param {function} base - the baseclass to inherit
     * @return {function} the result class
     */
    extend: function (cls, base) {
        if ( !base ) {
            Editor.error('The base class to extend from must be non-nil');
            return;
        }

        if ( !cls ) {
            Editor.error('The class to extend must be non-nil');
            return;
        }

        for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
        function __() { this.constructor = cls; }
        __.prototype = base.prototype;
        cls.prototype = new __();
        return cls;
    },

    /**
     * Removes all enumerable properties from object
     * @method clear
     * @memberof Editor.JS
     * @param {*} obj
     */
    clear: function (obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            delete obj[keys[i]];
        }
    },
};
