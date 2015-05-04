(function () {

var Path = require('fire-path');

Editor.registerPanel( 'package-manager.panel', {
    is: 'package-manager',

    properties: {
    },

    ready: function () {
        Editor.sendRequestToCore( 'package:query', function ( results ) {
            this.packages = results.map( function (item) {
                return { name: item.info.name, enabled: item.enabled, builtin: item.builtin };
            });
        }.bind(this));
    },

    _onReload: function ( event ) {
        event.stopPropagation();

        var item = this.$.list.itemForElement(event.target);
        Editor.sendToCore( 'package:reload', item.name );
    },
});

})();
