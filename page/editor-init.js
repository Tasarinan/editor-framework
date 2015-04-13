var Remote = require('remote');
var Util = require('util');

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

Editor.url = function (url) {
    return RemoteEditor.url(url);
};

// log

Editor.log = function ( text ) {
    'use strict';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log(text);
    Editor.sendToCore('console:log', text);
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
    Editor.sendToCore('console:warn', text);
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
    Editor.sendToCore('console:error', text);
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
    Editor.sendToCore('console:success', text);
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
    Editor.sendToCore('console:failed', text);
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
    Editor.sendToCore('console:info', text);
};
