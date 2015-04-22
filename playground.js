module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'load:foobar': function () {
        Editor.Package.load( Editor.url('editor://test/packages/foobar') );
    },

    'unload:foobar': function () {
        Editor.Package.unload( Editor.url('editor://test/packages/foobar') );
    },
};
