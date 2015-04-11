// NOTE: there are two way to initialize a panel,
// panel:ready happends when a panel open in a new window
// panel:open happends when a panel open in a exists window

Editor.sendRequestToCore( 'panel:ready', Editor.argv.panelID,
                        function ( detail ) {
    var panelID = detail['panel-id'];
    var panelInfo = detail['panel-info'];
    var packagePath = detail['package-path'];
    var argv = detail.argv;

    var Path = require('fire-path');
    Editor.PanelMng.load( Path.join( packagePath, panelInfo.view ),
                        panelID,
                        panelInfo,
                        function ( err, element ) {
                            element.argv = argv;

                            if ( panelInfo.type === 'dockable' ) {
                                var dock = new FireDock();
                                dock.setAttribute('fit', '');
                                dock.setAttribute('no-collapse', '');

                                var panel = new FirePanel();
                                panel.add(element);
                                dock.appendChild(panel);
                                document.body.appendChild(dock);

                                Editor.PanelMng.root = dock;
                            }
                            else {
                                document.body.appendChild(element);

                                Editor.PanelMng.root = element;
                            }

                            // save layout after css layouted
                            window.requestAnimationFrame ( function () {
                                Editor.sendToCore( 'window:save-layout',
                                                Editor.PanelMng.getLayout(),
                                                Editor.RequireIpcEvent );
                            });
                        } );
} );
