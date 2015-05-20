module.exports = {
    load: function () {
        Editor.Selection.register('normal');
    },

    unload: function () {
    },

    'selection:open': function () {
        Editor.Panel.open('selection.panel1');
        Editor.Panel.open('selection.panel2');
    },
};
