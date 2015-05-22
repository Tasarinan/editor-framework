var Protocol = require('protocol');
var Url = require('fire-url');
var Path = require('fire-path');
var Fs = require('fire-fs');

// native protocol register

// register protocol editor-framework://
Protocol.registerProtocol('editor-framework', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);
    var relativePath = data.hostname;
    if ( data.pathname ) {
        relativePath = Path.join( relativePath, data.pathname );
    }
    var file = Path.join( Editor.frameworkPath, relativePath );
    return new Protocol.RequestFileJob(file);
});

// register protocol app://
Protocol.registerProtocol('app', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);
    var relativePath = data.hostname;
    if ( data.pathname ) {
        relativePath = Path.join( relativePath, data.pathname );
    }
    var file = Path.join( Editor.cwd, relativePath );
    return new Protocol.RequestFileJob(file);
});

// register protocol widgets://
Protocol.registerProtocol('widgets', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);

    var info = Editor.Package.widgetInfo(data.hostname);
    if ( info ) {
        var file = Path.join( info.path, data.pathname );
        return new Protocol.RequestFileJob(file);
    }
    return new Protocol.RequestErrorJob(-6); // net::ERR_FILE_NOT_FOUND
});

// Editor.url protocol register

Editor._protocol2fn = {};

var _urlToPath = function ( base ) {
    return function ( urlInfo ) {
        if ( urlInfo.pathname ) {
            return Path.join( base, urlInfo.host, urlInfo.pathname );
        }
        return Path.join( base, urlInfo.host );
    };
};

Editor.url = function ( url ) {
    var urlInfo = Url.parse(url);

    if ( !urlInfo.protocol ) {
        Editor.error( 'Invalid url %s.', url );
        return null;
    }

    var fn = Editor._protocol2fn[urlInfo.protocol];
    if ( !fn ) {
        Editor.error( 'Failed to load url %s, please register the protocol for it.', url );
        return null;
    }

    return fn(urlInfo);
};

Editor.registerProtocol = function ( protocol, fn ) {
    Editor._protocol2fn[protocol+':'] = fn;
};

Editor.registerProtocol('editor-framework', _urlToPath(Editor.frameworkPath));
Editor.registerProtocol('app', _urlToPath(Editor.cwd));
