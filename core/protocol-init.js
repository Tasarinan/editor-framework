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

// register protocol bower://
Protocol.registerProtocol('bower', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);
    var relativePath = data.hostname;
    if ( data.pathname ) {
        relativePath = Path.join( relativePath, data.pathname );
    }
    var file = Path.join( Editor.cwd, 'bower_components', relativePath );
    return new Protocol.RequestFileJob(file);
});

// register protocol packages://

Protocol.registerProtocol('packages', function(request) {
    var url = decodeURIComponent(request.url);
    var data = Url.parse(url);

    var packagePath = Editor.Package.packagePath(data.hostname);
    if ( packagePath ) {
        var file = Path.join( packagePath, data.pathname );
        return new Protocol.RequestFileJob(file);
    }
    return new Protocol.RequestErrorJob(-6); // net::ERR_FILE_NOT_FOUND
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

function _url2path ( base ) {
    return function ( urlInfo ) {
        if ( urlInfo.pathname ) {
            return Path.join( base, urlInfo.host, urlInfo.pathname );
        }
        return Path.join( base, urlInfo.host );
    };
}

function _packages2path ( urlInfo ) {
    var packagePath = Editor.Package.packagePath(urlInfo.hostname);
    if ( packagePath ) {
        return Path.join( packagePath, urlInfo.pathname );
    }
    return '';
}

/**
 * Convert a url by its protocol to a filesystem path. This function is useful when you try to
 * get some internal file. You can use {@link Editor.registerProtocol} to register and map your filesystem
 * path to url. By default, Editor Framework register `editor-framework://` and `app://` protocol.
 * @param {string} url
 * @example
 * // it will return "{your-app-path}/foobar/foobar.js"
 * Editor.url('app://foobar/foobar.js');
 */
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

/**
 * Require module through url path
 * @param {string} url
 */
Editor.require = function ( url ) {
    return require( Editor.url(url) );
};

/**
 * Register a protocol so that {@link Editor.url} can use it to convert an url to the filesystem path.
 * The `fn` accept an url Object via [url.parse](https://iojs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)
 * @param {string} protocol
 * @param {function} fn
 * @example
 * var Path = require('path');
 *
 * var _url2path = function ( base ) {
 *     return function ( urlInfo ) {
 *         if ( urlInfo.pathname ) {
 *             return Path.join( base, urlInfo.host, urlInfo.pathname );
 *         }
 *         return Path.join( base, urlInfo.host );
 *     };
 * };
 *
 * Editor.registerProtocol('editor-framework', _url2path(Editor.frameworkPath));
 */
Editor.registerProtocol = function ( protocol, fn ) {
    Editor._protocol2fn[protocol+':'] = fn;
};

Editor.registerProtocol('editor-framework', _url2path(Editor.frameworkPath));
Editor.registerProtocol('app', _url2path(Editor.cwd));
Editor.registerProtocol('packages', _packages2path);
