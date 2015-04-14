var Ipc = require('ipc');

require('../share/ipc-init');

// messages

/**
 * Send message to editor-core, which is so called as main app, or atom shell's browser side.
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToCore = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2core'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to all pages.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options such as Editor.selfExcluded
 */
Editor.sendToWindows = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2wins'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to main page.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToMainWindow = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2mainwin'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Broadcast message to all pages and editor-core
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options such as Editor.selfExcluded
 */
Editor.sendToAll = function ( message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2all'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

/**
 * Send message to specific panel
 * @param {string} packageName - the package name
 * @param {string} panelName - the panel name
 * @param {string} message - the message to send
 * @param {...*} [arg] - whatever arguments the message needs
 */
Editor.sendToPanel = function ( packageName, panelName, message ) {
    'use strict';
    if ( typeof message === 'string' ) {
        var args = [].slice.call( arguments );
        Ipc.send.apply( Ipc, ['editor:send2panel'].concat( args ) );
    }
    else {
        Editor.error('The message must be provided');
    }
};

// Communication Patterns

var nextSessionId = 0;
var replyCallbacks = {};

/**
 * @param {string} request - the request to send
 * @param {...*} [arg] - whatever arguments the request needs
 * @param {function} reply - the callback used to handle replied arguments
 */
Editor.sendRequestToCore = function (request) {
    'use strict';
    if (typeof request === 'string') {
        var args = [].slice.call(arguments, 1);
        var reply = args[args.length - 1];
        if (typeof reply === 'function') {
            args.pop();

            var sessionId = nextSessionId++;
            var key = "" + sessionId;
            replyCallbacks[key] = reply;

            Ipc.send('editor:sendreq2core', request, args, sessionId);
        }
        else {
            Editor.error('The reply must be of type function');
        }
    }
    else {
        Editor.error('The request must be of type string');
    }
};

Ipc.on('editor:send-reply-back', function replyCallback (args, sessionId) {
    'use strict';
    var key = "" + sessionId;
    var cb = replyCallbacks[key];
    if (cb) {
        cb.apply(null, args);

        //if (sessionId + 1 === nextSessionId) {
        //    --nextSessionId;
        //}
        delete replyCallbacks[key];
    }
    else {
        Editor.error('non-exists callback of session:', sessionId);
    }
});

Ipc.on('editor:send2panel', function () {
    Editor.Panel.dispatch.apply(Editor.Panel,arguments);
});
