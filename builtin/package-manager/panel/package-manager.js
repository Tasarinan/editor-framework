(function () {

var Path = require('fire-path');

window['package-manager'] = {};
window['package-manager'].panel = Polymer( {
    is: "package-manager",

    properties: {
    },

    'panel:open': function () {
        Editor.sendRequestToCore( 'package:query', function ( results ) {
            this.packages = results.map( function (item) {
                return { name: item.info.name, enabled: item.enabled, builtin: item.builtin };
            });
        }.bind(this));
    },
});

})();
