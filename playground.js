module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foo:bar': function () {
        var Winston = require('winston');
        var Util = require('util');

        // var text = Util.format( '%s', new Error('foobar') );
        // Winston.normal(text);
        Editor.log('foobar %d', 20);
    },

};
