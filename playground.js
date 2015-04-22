module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foobar:load': function () {
        Editor.Package.load( Editor.url('editor://test/packages/foobar') );
    },

    'foobar:unload': function () {
        Editor.Package.unload( Editor.url('editor://test/packages/foobar') );
    },

    'foobar:open': function () {
        Editor.Panel.open( 'MyTest.Foobar', {
            'message': 'Hello Foobar'
        });
    },
};
