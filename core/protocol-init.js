var Protocol = require('protocol');
var Url = require('fire-url');
var Path = require('fire-path');

// native protocol register

// register protocol editor://
Protocol.registerProtocol('editor', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);
    var relativePath = data.hostname;
    if ( data.pathname ) {
        relativePath = Path.join( relativePath, data.pathname );
    }
    var file = Path.join( Editor.cwd, relativePath );
    return new Protocol.RequestFileJob(file);
});

// Editor.url protocol register

Editor._protocol2fn = {};

var _urlToPath = function ( urlInfo ) {
    if ( urlInfo.pathname ) {
        return Path.join( Editor.cwd, urlInfo.host, urlInfo.pathname );
    }
    return Path.join( Editor.cwd, urlInfo.host );
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

Editor.registerProtocol('editor', _urlToPath);
