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

    'console:log': function () {
        var text = this._format(arguments);
        this.add( 'log', text );
    },

    'console:success': function () {
        var text = this._format(arguments);
        this.add( 'success', text );
    },

    'console:failed': function () {
        var text = this._format(arguments);
        this.add( 'failed', text );
    },

    'console:info': function () {
        var text = this._format(arguments);
        this.add( 'info', text );
    },

    'console:warn': function () {
        var text = this._format(arguments);
        this.add( 'warn', text );
    },

    'console:error': function () {
        var text = this._format(arguments);
        this.add( 'error', text );
    },

    add: function ( type, text ) {
        this.logs.push({
            type: type,
            text: text,
            count: 0,
        });
        this.logs = this.logs.slice();
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
