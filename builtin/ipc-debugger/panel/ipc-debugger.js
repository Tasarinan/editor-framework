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
            this.ipcInfos = results;
        }.bind(this));
    },
});

})();
