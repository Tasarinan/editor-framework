(function () {

var Path = require('fire-path');

var name = 'package-manager';
window[name] = {};
window[name].panel = Polymer( {
    is: name,

    properties: {
    },

    ready: function () {
        Editor.sendRequestToCore( 'package:query', function ( results ) {
            this.packages = results.map( function (item) {
                return { name: item.info.name, enabled: item.enabled, builtin: item.builtin };
            });
        }.bind(this));
    },
});

})();
