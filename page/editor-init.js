(function () {

var Remote = require('remote');
var Util = require('util');
var Ipc = require('ipc');
var Path = require('fire-path');
var Url = require('fire-url');

window.Editor = window.Editor || {};
var RemoteEditor = Remote.getGlobal('Editor');

// init argument list sending from core by url?queries
// format: '?foo=bar&hell=world'
// skip '?'
var queryString = decodeURIComponent(location.search.substr(1));
var queryList = queryString.split('&');
var queries = {};
for ( var i = 0; i < queryList.length; ++i ) {
    var pair = queryList[i].split('=');
    if ( pair.length === 2) {
        queries[pair[0]] = pair[1];
    }
}
Editor.argv = queries;
Editor.cwd = RemoteEditor.url('editor://');

// url
Editor.url = function (url) {
    // NOTE: we cache editor:// protocol to get rid of ipc-sync function calls
    var urlInfo = Url.parse(url);
    if ( urlInfo.protocol === 'editor:' ) {
        if ( urlInfo.pathname ) {
            return Path.join( Editor.cwd, urlInfo.host, urlInfo.pathname );
        }
        return Path.join( Editor.cwd, urlInfo.host );
    }

    // try ipc-sync function
    return RemoteEditor.url(url);
};

require( Editor.url('editor://share/platform')) ;
Editor.JS = require( Editor.url('editor://share/js-utils')) ;

// log functions

Editor.log = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log(text);
    Editor.sendToCore('console:log', {
        message: text
    });
};

Editor.warn = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.warn(text);
    Editor.sendToCore('console:warn', {
        message: text
    });
};

Editor.error = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.error(text);
    Editor.sendToCore('console:error', {
        message: text
    });
};

Editor.success = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: green');
    Editor.sendToCore('console:success', {
        message: text
    });
};

Editor.failed = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: red');
    Editor.sendToCore('console:failed', {
        message: text
    });
};

Editor.info = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.info(text);
    Editor.sendToCore('console:info', {
        message: text
    });
};

})();
