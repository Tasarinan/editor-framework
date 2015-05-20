module.exports = {
    load: function () {
        Editor.Selection.register('normal');
    },

    unload: function () {
    },

    'selection-demo:open': function () {
        Editor.Panel.open('selection-demo.panel1');
        Editor.Panel.open('selection-demo.panel2');
    },
};
