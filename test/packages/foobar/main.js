module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foobar:open': function () {
        Editor.Panel.open( 'foobar.panel' );
    },
};
