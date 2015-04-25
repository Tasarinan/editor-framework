(function () {

var Remote = require('remote');
var Ipc = require('ipc');
var Util = require('util');
var Path = require('fire-path');
var Url = require('fire-url');

window.Editor = window.Editor || {};

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

// init & cache remote
Editor.remote = Remote.getGlobal('Editor');
Editor.cwd = Editor.remote.url('editor://');
Editor.isDev = Editor.remote.isDev;

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
    return Editor.remote.url(url);
};

require( Editor.url('editor://share/platform'));
Editor.JS = require( Editor.url('editor://share/js-utils'));
require( Editor.url('editor://page/ipc-init'));

// ==========================
// console log API
// ==========================

Editor.log = function () {
    'use strict';
    console.log.apply( console, arguments );
    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:log'].concat(args) );
};

Editor.success = function () {
    'use strict';

    var text = arguments.length > 0 ?  arguments[0] : '';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: green');

    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:success'].concat(args) );
};

Editor.failed = function () {
    'use strict';

    var text = arguments.length > 0 ?  arguments[0] : '';
    if (arguments.length <= 1) {
        text = '' + text;
    }
    else {
        text = Util.format.apply(Util, arguments);
    }
    console.log('%c' + text, 'color: red');

    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:failed'].concat(args) );
};

Editor.info = function () {
    'use strict';
    console.info.apply( console, arguments );
    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:info'].concat(args) );
};

Editor.warn = function () {
    'use strict';
    console.warn.apply( console, arguments );
    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:warn'].concat(args) );
};

Editor.error = function () {
    'use strict';
    console.error.apply( console, arguments );
    var args = [].slice.call(arguments);
    Editor.sendToCore.apply( Editor, ['console:error'].concat(args) );
};

// ==========================
// load modules
// ==========================

Editor.Panel = require( Editor.url('editor://page/editor-panel'));
Editor.MainMenu = require( Editor.url('editor://page/main-menu'));

})();
