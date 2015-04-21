var ipcListener = new Editor.IpcListener();

module.exports = {
    load: function () {
        ipcListener.on('main-menu:add', function () {
            console.log('hello?');
        });
    },

    unload: function () {
        ipcListener.clear();
    },
};
