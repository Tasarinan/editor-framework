(function () {

// only window open with panelID needs send request
if ( Editor.argv.panelID ) {
    Editor.Panel.load( Editor.argv.panelID, function ( err, frameEL, panelInfo ) {
        if ( err ) {
            return;
        }

        if ( panelInfo.type === 'dockable' ) {
            var dock = new EditorUI.Dock();
            dock.setAttribute('no-collapse', '');
            dock.classList.add('fit');

            var panelEL = new EditorUI.Panel();
            panelEL.add(frameEL);
            panelEL.select(0);

            Polymer.dom(dock).appendChild(panelEL);
            document.body.appendChild(dock);

            EditorUI.DockUtils.root = dock;
        }
        else {
            document.body.appendChild(frameEL);

            EditorUI.DockUtils.root = frameEL;
        }
        EditorUI.DockUtils.reset();

        Editor.sendToCore( 'panel:ready', Editor.argv.panelID );

        // save layout after css layouted
        Editor.saveLayout();
    });
}

})();
