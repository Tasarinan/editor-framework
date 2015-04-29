module.exports = {
    load: function () {
    },

    unload: function () {
    },

    'foobar:open': function () {
        Editor.Panel.open( 'foobar.panel' );
    },

    'foobar:test': function () {
        var panelID = 'foobar.panel';
        var editorWin = Editor.Panel.findWindow(panelID);
        if ( editorWin ) {
            var id = editorWin.sendRequestToPage('foobar:hello', function ( text ) {
                Editor.log('reply %s', text);
            });
            editorWin.cancelRequestToPage(id);
        }
        else {
            Editor.log('Can not find window by panel %s', panelID);
        }
    },
};
