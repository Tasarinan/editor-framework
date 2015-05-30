module.exports = {
    load: function () {
        Editor.Selection.register('normal');
    },

    unload: function () {
    },

    'demo-selection:open': function () {
        Editor.Panel.open('demo-selection.panel1');
        Editor.Panel.open('demo-selection.panel2');
    },
};
