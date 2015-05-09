var Package = {};

Package.reload = function ( name ) {
    Editor.sendToCore( 'package:reload', name );
};

Package.query = function ( cb ) {
    Editor.sendRequestToCore( 'package:query', function ( results ) {
        if ( cb ) cb ( results );
    });
};

module.exports = Package;
