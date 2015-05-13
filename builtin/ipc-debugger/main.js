var Async = require('async');
var Ipc = require('ipc');

var inspects = {};

module.exports = {
    load: function () {
    },

    unload: function () {
        for ( var name in inspects ) {
            Ipc.removeListener( name, inspects[name] );
        }
    },

    'ipc-debugger:open': function () {
        Editor.Panel.open('ipc-debugger.panel');
    },

    'ipc-debugger:query': function ( reply ) {
        var windows = Editor.Window.windows;
        var infoList = [];
        for ( var p in Ipc._events ) {
            var listeners = Ipc._events[p];
            var count = Array.isArray(listeners) ? listeners.length : 1;
            infoList.push({
                name: p,
                level: 'core',
                count: count,
                inspect: inspects[p] !== undefined,
            });
        }

        Async.each( windows, function ( win, done ) {
            win.sendRequestToPage( 'ipc-debugger:query', function ( infos ) {
                if ( infos ) {
                    infoList = infoList.concat(infos);
                }
                done();
            });
        }, function ( err ) {
            reply(infoList);
        });
    },

    'ipc-debugger:inspect': function ( name ) {
        var fn = function () {
            var args = [].slice.call( arguments, 0 );
            args.unshift( 'ipc-debugger[core][' + name + ']' );
            Editor.success.apply( Editor, args );
        };
        inspects[name] = fn;
        Ipc.on( name, fn );
    },

    'ipc-debugger:uninspect': function ( name ) {
        var fn = inspects[name];
        if ( fn ) {
            Ipc.removeListener( name, fn );
            delete inspects[name];
        }
    },
};
