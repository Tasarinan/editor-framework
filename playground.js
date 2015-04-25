module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foo:bar': function () {
        var Winston = require('winston');
        var Util = require('util');

        Editor.error( new Error('hello world') );
    },

};
