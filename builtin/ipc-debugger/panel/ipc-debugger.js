(function () {

var Ipc = require('ipc');

var name = 'ipc-debugger';
window[name] = {};
window[name].panel = Polymer({
    is: name,

    properties: {
    },

    ready: function () {
        Editor.sendRequestToCore( 'ipc-debugger:query', function ( results ) {
            this.ipcInfos = results.filter ( function ( item ) {
                return !/^ATOM/.test(item.name);
            });
            this.ipcInfos.sort( function ( a, b ) {
                var result = a.level.localeCompare( b.level );
                if ( result === 0 ) {
                    result = a.name.localeCompare(b.name);
                }
                return result;
            });

            // NOTE: the sort will not repaint in x-repeat,
            // TODO: keep watching on Polymer updates
            this.ipcInfos = this.ipcInfos.slice();
        }.bind(this));
    },
});

})();
