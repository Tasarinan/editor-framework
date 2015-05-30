var Package = {};

Package.reload = function ( name ) {
    Editor.sendToCore( 'package:reload', name );
};

Package.queryInfos = function ( cb ) {
    Editor.sendRequestToCore( 'package:query-infos', function ( results ) {
        if ( cb ) cb ( results );
    });
};

Package.queryInfo = function ( name, cb ) {
    Editor.sendRequestToCore( 'package:query-info', name, function ( info ) {
        if ( cb ) cb ( info );
    });
};

module.exports = Package;
