var Async = require('async');
var Ipc = require('ipc');

module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'ipc-debugger:open': function () {
        Editor.Panel.open('ipc-debugger.panel');
    },

    'ipc-debugger:query': function ( reply ) {
        var windows = Editor.Window.windows;
        var infoList = [];
        for ( var p in Ipc._events ) {
            infoList.push({
                name: p,
                level: 'core',
            });
        }

        Async.each( windows, function ( win, done ) {
            win.sendRequestToPage( 'ipc-debugger:query', function ( infos ) {
                infoList = infoList.concat(infos);
                done();
            });
        }, function ( err ) {
            reply(infoList);
        });
    },
};
