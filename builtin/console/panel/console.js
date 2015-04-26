(function () {

var Ipc = require('ipc');
var Util = require('util');

window['editor-console'] = {};
window['editor-console'].panel = Polymer( {
    is: 'editor-console',

    properties: {
    },

    ready: function () {
        this.logs = [];
    },

    'console:log': function ( message ) {
        this.add( 'log', message );
    },

    'console:success': function ( message ) {
        this.add( 'success', message );
    },

    'console:failed': function ( message ) {
        this.add( 'failed', message );
    },

    'console:info': function ( message ) {
        this.add( 'info', message );
    },

    'console:warn': function ( message ) {
        this.add( 'warn', message );
    },

    'console:error': function ( message ) {
        this.add( 'error', message );
    },

    add: function ( type, text ) {
        this.logs.push({
            type: type,
            text: text,
            count: 0,
        });

        // to make sure after layout and before render
        window.requestAnimationFrame ( function () {
            this.scrollTop = this.scrollHeight;
        }.bind(this) );
    },

    clear: function () {
        this.logs = [];
    },

    _format: function ( args ) {
        var text = args.length > 0 ?  args[0] : '';
        if (args.length <= 1) {
            text = '' + text;
        } else {
            text = Util.format.apply(Util, args);
        }
        return text;
    },
});

})();
