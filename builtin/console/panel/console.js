(function () {

var Ipc = require('ipc');
var Util = require('util');

Editor.registerPanel( 'console.panel', {
    is: 'editor-console',

    properties: {
    },

    ready: function () {
        this.logs = [];
        Editor.sendRequestToCore( 'console:query', function ( results ) {
            for ( var i = 0; i < results.length; ++i ) {
                var item = results[i];
                this.add( item.type, item.message );
            }
        }.bind(this));
    },

    attached: function () {
        EditorUI.update( this, 'logs' );
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

    'console:clear': function () {
        this.clear();
    },

    add: function ( type, text ) {
        this.push('logs', {
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
        Editor.sendToCore('console:clear');
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
