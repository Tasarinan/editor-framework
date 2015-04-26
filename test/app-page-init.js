(function () {
    var Async = require('async');

    var importPanel = function ( dockAt, panelID, cb ) {
        Editor.sendRequestToCore( 'panel:page-ready', panelID, function ( panelInfo ) {
            var Path = require('fire-path');
            var viewPath = Path.join( panelInfo.path, panelInfo.view );

            Editor.Panel.load(viewPath,
                              panelID,
                              panelInfo,
                              function ( err, element ) {
                                  dockAt.add(element);
                                  dockAt.$.tabs.select(0);
                                  cb();
                              });
        });
    };

    var panel1 = document.getElementById('panel1');
    var panel2 = document.getElementById('panel2');

    Async.series([
        function ( done ) {
            importPanel( panel1, 'ipc-debugger.panel', done );
        },

        function ( done ) {
            importPanel( panel2, 'package-manager.panel', done );
        },
    ], function () {
        EditorUI.DockUtils.root = document.getElementById('mainDock');
        EditorUI.DockUtils.reset();
    });

})();
