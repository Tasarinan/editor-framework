module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foobar:foo-bar': function ( text ) {
        Editor.success(text);
    },
};
