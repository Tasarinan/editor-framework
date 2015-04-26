(function () {

var Ipc = require('ipc');

var name = 'ipc-debugger';
window[name] = {};
window[name].panel = Polymer({
    is: name,

    properties: {
    },

    'panel:open': function () {
    },
});

})();
