(function () {

EditorUI.MainDock = Polymer({
    is: 'main-dock',

    properties: {
    },

    attached: function () {
        this.async(function() {
            this.lightDomReady();
        });
    },

    lightDomReady: function () {
        EditorUI.DockUtils.root = this.$.root;
        Editor.loadLayout( this, function () {
            // TODO: if this is default layout, reset it
            // EditorUI.DockUtils.reset();
        });
    },
});

})();
