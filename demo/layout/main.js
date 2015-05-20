module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'layout-demo:reset': function () {
        var Fs = require('fs');
        var layoutInfo = JSON.parse(Fs.readFileSync(Editor.url('app://demo/layout/layout.json') ));
        Editor.sendToMainWindow( 'editor:reset-layout', layoutInfo);
    },
};
