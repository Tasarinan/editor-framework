(function () {

// NOTE: there are two way to initialize a panel,
// panel:ready happends when a panel open in a new window
// panel:open happends when a panel open in a exists window

// only window open with panelID needs send request
if ( Editor.argv.panelID ) {
    Editor.sendRequestToCore('panel:page-ready', Editor.argv.panelID,
                             function ( detail ) {
        var panelInfo = detail['panel-info'];

        var Path = require('fire-path');
        var viewPath = Path.join( panelInfo.path, panelInfo.view );

        Editor.Panel.load( viewPath,
                           Editor.argv.panelID,
                           panelInfo,
                           function ( err, element ) {
                               if ( panelInfo.type === 'dockable' ) {
                                   var dock = new EditorUI.Dock();
                                   dock.setAttribute('fit', '');
                                   dock.setAttribute('no-collapse', '');

                                   var panel = new EditorUI.Panel();
                                   panel.add(element);
                                   panel.select(0);
                                   dock.appendChild(panel);
                                   document.body.appendChild(dock);

                                   EditorUI.DockUtils.root = dock;
                               }
                               else {
                                   document.body.appendChild(element);

                                   EditorUI.DockUtils.root = element;
                               }
                               EditorUI.DockUtils.reset();

                               Editor.sendToCore( 'panel:ready', Editor.argv.panelID );

                               // save layout after css layouted
                               window.requestAnimationFrame ( function () {
                                   Editor.sendToCore( 'window:save-layout',
                                                      Editor.Panel.getLayout(),
                                                      Editor.requireIpcEvent );
                               });
                           });
    } );
}

})();
