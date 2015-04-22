var ipcListener = new Editor.IpcListener();

module.exports = {
    load: function () {
        ipcListener.on('foo:bar', function () {
            var Menu = require('menu');
            var MenuItem = require('menu-item');

            console.log( new MenuItem({
                click: function () { console.log('yes'); },
                selector: 'hell',
                type: 'submenu',
                label: 'Hell',
                sublabel: 'Hell',
                accelerator: 'Command+A',
                submenu: new Menu(),
                id: 'hell',
            }) );
        });
    },

    unload: function () {
        ipcListener.clear();
    },
};
