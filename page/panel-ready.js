(function () {

// only window open with panelID needs send request
if ( Editor.argv.panelID ) {
    Editor.Panel.load( Editor.argv.panelID, function ( err, viewEL, panelInfo ) {
        if ( err ) {
            return;
        }

        if ( panelInfo.type === 'dockable' ) {
            var dock = new EditorUI.Dock();
            dock.setAttribute('no-collapse', '');
            dock.classList.add('fit');

            var panel = new EditorUI.Panel();
            panel.add(viewEL);
            panel.select(0);

            Polymer.dom(dock).appendChild(panel);
            document.body.appendChild(dock);

            EditorUI.DockUtils.root = dock;
        }
        else {
            document.body.appendChild(viewEL);

            EditorUI.DockUtils.root = viewEL;
        }
        EditorUI.DockUtils.reset();

        Editor.sendToCore( 'panel:ready', Editor.argv.panelID );

        // save layout after css layouted
        Editor.saveLayout();
    });
}

})();
