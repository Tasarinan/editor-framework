var Ipc = require('ipc');

var CmdP = {};

Ipc.on( 'cmdp:show', function () {
    Editor.log('hello');
});

module.exports = CmdP;
