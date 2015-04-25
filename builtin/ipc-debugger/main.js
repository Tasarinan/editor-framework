module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'ipc-debugger:open': function () {
        Editor.Panel.open('ipc-debugger.panel');
    },
};
