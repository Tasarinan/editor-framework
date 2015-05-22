/**
 * indicates whether executes in node.js application
 * @property isNode
 * @type {boolean}
 */
Editor.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
Editor.isElectron = !!(Editor.isNode && ('electron' in process.versions));
Editor.isNative = Editor.isElectron;

/**
 * indicates whether executes in common web browser
 * @property isPureWeb
 * @type {boolean}
 */
Editor.isPureWeb = !Editor.isNode && !Editor.isNative; // common web browser

/**
 * indicates whether executes in common web browser, or editor's window process(atom-shell's renderer context)
 * @property isPageLevel
 * @type {boolean}
 */
if (Editor.isElectron) {
    Editor.isPageLevel = typeof process !== 'undefined' && process.type === 'renderer';
} else {
    Editor.isPageLevel = (typeof __dirname === 'undefined' || __dirname === null);
}

/**
 * indicates whether executes in editor's core process(atom-shell's browser context)
 * @property isEditorCore
 * @type {boolean}
 */
Editor.isCoreLevel = typeof process !== 'undefined' && process.type === 'browser';

if (Editor.isNode) {
    /**
     * indicates whether executes in OSX
     * @property isDarwin
     * @type {boolean}
     */
    Editor.isDarwin = process.platform === 'darwin';

    /**
     * indicates whether executes in Windows
     * @property isWin32
     * @type {boolean}
     */
    Editor.isWin32 = process.platform === 'win32';
} else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var platform = window.navigator.platform;
    Editor.isDarwin = platform.substring(0, 3) === 'Mac';
    Editor.isWin32 = platform.substring(0, 3) === 'Win';
}


/**
 * Check if running in retina display
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Editor, 'isRetina', {
    get: function () {
        return Editor.isPageLevel && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
});

