var Protocol = require('protocol');

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
