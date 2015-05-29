var Ipc = require('ipc');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var Path = require('fire-path');
var Fs = require('fire-fs');

function getDefaultMainMenu () {
    return [
        // Help
        {
           label: 'Help',
           id: 'help',
           submenu: [
           ]
        },

        // Fireball
        {
            label: 'Editor Framework',
            position: 'before=help',
            submenu: [
                {
                    label: 'Hide',
                    accelerator: 'Command+H',
                    selector: 'hide:'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:'
                },
                {
                    label: 'Show All',
                    selector: 'unhideAllApplications:'
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        Editor.Window.saveWindowStates();
                        Editor.quit();
                    }
                },
            ]
        },

        // Edit
        {
            label: 'Edit',
            submenu: [
                {
                   label: 'Undo',
                   accelerator: 'Command+Z',
                   selector: 'undo:'
                },
                {
                   label: 'Redo',
                   accelerator: 'Shift+Command+Z',
                   selector: 'redo:'
                },
                { type: 'separator' },
                {
                   label: 'Cut',
                   accelerator: 'Command+X',
                   selector: 'cut:'
                },
                {
                   label: 'Copy',
                   accelerator: 'Command+C',
                   selector: 'copy:'
                },
                {
                   label: 'Paste',
                   accelerator: 'Command+V',
                   selector: 'paste:'
                },
                {
                   label: 'Select All',
                   accelerator: 'Command+A',
                   selector: 'selectAll:'
                },
            ]
        },

        // Window
        {
            label: 'Window',
            id: 'window',
            submenu: Editor.isDarwin ?
            [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:',
                },
                {
                    label: 'Close',
                    accelerator: 'Command+W',
                    selector: 'performClose:',
                },
                { type: 'separator' },
                {
                    label: 'Bring All to Front',
                    selector: 'arrangeInFront:'
                },
            ] :
            [
                {
                    label: "Close",
                    accelerator: 'Command+W',
                    click: function () {
                        Editor.Window.saveWindowStates();
                        Editor.quit();
                    },
                }
            ]
        },

        // Panel
        {
            label: 'Panel',
            id: 'panel',
            submenu: [
            ]
        },

        // Layout
        {
            label: 'Layout',
            id: 'layout',
            submenu: [
                {
                    label: 'Debuggers',
                    click: function () {
                        var layoutInfo = JSON.parse(Fs.readFileSync(Editor.url('editor-framework://static/layout.json') ));
                        Editor.sendToMainWindow( 'editor:reset-layout', layoutInfo);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Empty',
                    click: function () {
                        Editor.sendToMainWindow( 'editor:reset-layout', null);
                    }
                },
            ]
        },

        // Developer
        {
            label: 'Developer',
            id: 'developer',
            submenu: [
                {
                    label: 'Command-P',
                    accelerator: 'CmdOrCtrl+P',
                    click: function() {
                        Editor.mainWindow.focus();
                        Editor.sendToMainWindow('cmdp:show');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function() {
                        // DISABLE: Editor.clearLog();
                        BrowserWindow.getFocusedWindow().reload();
                    }
                },
                {
                    label: 'Reload Ignoring Cache',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: function() {
                        // DISABLE: Editor.clearLog();
                        BrowserWindow.getFocusedWindow().reloadIgnoringCache();
                    }
                },
                {
                    label: 'Reload Editor.App',
                    click: function() {
                        Editor.App.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Inspect Element',
                    accelerator: 'CmdOrCtrl+Shift+C',
                    click: function() {
                        var nativeWin = BrowserWindow.getFocusedWindow();
                        var editorWin = Editor.Window.find(nativeWin);
                        if ( editorWin ) {
                            editorWin.sendToPage( 'window:inspect' );
                        }
                    }
                },
                {
                    label: 'Developer Tools',
                    accelerator: 'CmdOrCtrl+Alt+I',
                    click: function() { BrowserWindow.getFocusedWindow().openDevTools(); }
                },
                {
                    label: 'Debug Core',
                    type: 'checkbox',
                    checked: false,
                    click: function() {
                        Editor.Debugger.toggle();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Test',
                    submenu: [
                        {
                            label: 'Throw an Uncaught Exception',
                            click: function() {
                                throw new Error('editor-framework Unknown Error');
                            }
                        },
                        {
                            label: 'send2panel \'foo:bar\' foobar.panel',
                            click: function() {
                                Editor.sendToPanel( "foobar.panel", "foo:bar" );
                            }
                        },
                    ],
                },
                { type: 'separator' },
            ]
        },
    ];
}

var _mainMenu = new Editor.Menu( getDefaultMainMenu() );

/**
 * The main menu module for manipulating main menu items
 * @namespace Editor.MainMenu
 */
var MainMenu = {};

/**
 * Apply main menu changes
 * @memberof Editor.MainMenu
 * @method apply
 */
MainMenu.apply = function () {
    Menu.setApplicationMenu(_mainMenu.nativeMenu);
};

/**
 * Reset main menu to its default template
 * @memberof Editor.MainMenu
 * @method reset
 */
MainMenu.reset = function () {
    _mainMenu.reset( getDefaultMainMenu() );
    MainMenu.apply();
};

/**
 * Build a template into menu item and add it to path
 * @memberof Editor.MainMenu
 * @method add
 * @param {string} path - A menu path
 * @param {object[]|object} template
 */
MainMenu.add = function ( path, template ) {
    if ( _mainMenu.add( path, template ) ) {
        MainMenu.apply();
    }
};

/**
 * Remove menu item at path.
 * @memberof Editor.MainMenu
 * @method remove
 * @param {string} path - A menu path
 */
MainMenu.remove = function ( path ) {
    if ( _mainMenu.remove( path ) ) {
        MainMenu.apply();
    }
};

/**
 * Set menu options at path.
 * @memberof Editor.MainMenu
 * @method set
 * @param {string} path - A menu path
 * @param {object} [options]
 * @param {NativeImage} [options.icon] - A [NativeImage](https://github.com/atom/electron/blob/master/docs/api/native-image.md)
 * @param {boolean} [options.enabled]
 * @param {boolean} [options.visible]
 * @param {boolean} [options.checked] - NOTE: You must set your menu-item type to 'checkbox' to make it work
 */
MainMenu.set = function ( path, options ) {
    if ( _mainMenu.set( path, options ) ) {
        MainMenu.apply();
    }
};

// ipc
Ipc.on('main-menu:reset', function () {
    MainMenu.reset();
});

Ipc.on('main-menu:add', function ( path, template ) {
    MainMenu.add( path, template );
});

Ipc.on('main-menu:remove', function ( path ) {
    MainMenu.remove( path );
});

Ipc.on('main-menu:set', function ( path, options ) {
    MainMenu.set( path, options );
});

module.exports = MainMenu;
